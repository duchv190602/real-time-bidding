import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

/**
 * useAuctionSocket — manages a STOMP WebSocket connection to the bidding-service.
 *
 * @param {string} auctionId
 * @param {string|null} token — JWT access token (optional, anonymous if null)
 * @param {{ onBidUpdate, onConnect, onDisconnect }} callbacks
 */
export function useAuctionSocket(auctionId, token, callbacks) {
  // Use ref to always have latest callbacks without re-connecting
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!auctionId) return;

    // bidding-service context-path is /bidding, WebSocket endpoint is /ws
    // Full URL: ws://localhost:8082/bidding/ws
    const WS_URL = 'ws://localhost:8082/bidding/ws';

    const connectHeaders = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log(`[WS] ✅ Connected → subscribing /topic/auction/${auctionId}`);
        callbacksRef.current?.onConnect?.();

        client.subscribe(`/topic/auction/${auctionId}`, (stompMessage) => {
          try {
            const update = JSON.parse(stompMessage.body);
            console.log('[WS] 📨 Received bid update:', update);
            callbacksRef.current?.onBidUpdate?.(update);
          } catch (err) {
            console.error('[WS] Failed to parse message:', err);
          }
        });
      },

      onDisconnect: () => {
        console.log('[WS] ❌ Disconnected from auction:', auctionId);
        callbacksRef.current?.onDisconnect?.();
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers['message']);
        callbacksRef.current?.onDisconnect?.();
      },

      onWebSocketError: (error) => {
        console.warn('[WS] WebSocket error (service may be offline):', error.type);
        callbacksRef.current?.onDisconnect?.();
      },
    });

    client.activate();

    return () => {
      console.log('[WS] Cleaning up for auction:', auctionId);
      client.deactivate();
    };
  }, [auctionId, token]); // Re-connect if auction changes or user logs in/out
}
