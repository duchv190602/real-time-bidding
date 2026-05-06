package com.duc.auction.service;

import com.duc.auction.constant.AuctionStatus;
import com.duc.auction.dto.event.AuctionCreatedEvent;
import com.duc.auction.dto.request.CreateAuctionRequest;
import com.duc.auction.dto.request.UpdateAuctionRequest;
import com.duc.auction.dto.response.AuctionResponse;
import com.duc.auction.entity.Auction;
import com.duc.auction.exception.AppException;
import com.duc.auction.exception.ErrorCode;
import com.duc.auction.mapper.AuctionMapper;
import com.duc.auction.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.web.multipart.MultipartFile;
import com.duc.auction.producer.AuctionEventProducer;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionService {
    private final AuctionRepository auctionRepository;
    private final AuctionMapper auctionMapper;
    private final AuctionEventProducer auctionEventProducer;

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    public AuctionResponse createAuction(CreateAuctionRequest request, MultipartFile file) {
        log.info("check 1");
        Auction auction = auctionMapper.toEntity(request);
        auction.setStatus(AuctionStatus.DRAFT);
        try {
            log.info("check 2");
            handleImageUpload(auction, file);
        } catch (IOException e) {
            log.error("Failed to store uploaded image", e);
            throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED);
        }
        log.info("check 3");
        auction = auctionRepository.save(auction);
        return auctionMapper.toResponse(auction);
    }

    public Page<AuctionResponse> getAuctions(int page, int size, AuctionStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Auction> auctions;
        
        java.util.List<AuctionStatus> allowedStatuses = java.util.List.of(
                AuctionStatus.ACTIVE, AuctionStatus.APPROVED, AuctionStatus.ENDED
        );

        if (status != null) {
            if (allowedStatuses.contains(status)) {
                auctions = auctionRepository.findByStatus(status, pageable);
            } else {
                auctions = Page.empty(pageable);
            }
        } else {
            auctions = auctionRepository.findByStatusIn(allowedStatuses, pageable);
        }
        return auctions.map(auctionMapper::toResponse);
    }

    public Page<AuctionResponse> getAuctionsForAdmin(int page, int size, AuctionStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Auction> auctions;
        if (status != null) {
            auctions = auctionRepository.findByStatus(status, pageable);
        } else {
            auctions = auctionRepository.findAll(pageable);
        }
        return auctions.map(auctionMapper::toResponse);
    }

    public AuctionResponse getAuctionById(String id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUCTION_NOT_FOUND));
        return auctionMapper.toResponse(auction);
    }

    public AuctionResponse updateAuctionProduct(String id, UpdateAuctionRequest request) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getStatus() != AuctionStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_STATUS_UPDATE);
        }

        auctionMapper.updateAuction(auction, request);
        auction = auctionRepository.save(auction);
        return auctionMapper.toResponse(auction);
    }

    public AuctionResponse approveAuction(String id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getStatus() != AuctionStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_STATUS_UPDATE);
        }

        if (auction.getEndAt() == null || auction.getStartPrice() == null || auction.getBidStep() == null) {
            throw new AppException(ErrorCode.INVALID_STATUS_UPDATE);
        }

        auction.setStatus(AuctionStatus.APPROVED);
        auction = auctionRepository.save(auction);
        return auctionMapper.toResponse(auction);
    }

    public AuctionResponse startAuction(String id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getStatus() != AuctionStatus.APPROVED) {
            throw new AppException(ErrorCode.INVALID_STATUS_UPDATE);
        }

        auction.setStartAt(LocalDateTime.now());
        auction.setStatus(AuctionStatus.ACTIVE);
        
        auctionEventProducer.sendAuctionCreatedEvent(
                        AuctionCreatedEvent.builder()
                        .auctionId(auction.getId())
                        .startPrice(auction.getStartPrice())
                        .bidStep(auction.getBidStep())
                        .startTime(auction.getStartAt())
                        .endTime(auction.getEndAt())
                        .build()
        );

        auction = auctionRepository.save(auction);
        return auctionMapper.toResponse(auction);
    }

    public AuctionResponse cancelAuction(String id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getStatus() == AuctionStatus.ENDED || auction.getStatus() == AuctionStatus.CANCELLED) {
            throw new AppException(ErrorCode.INVALID_STATUS_UPDATE);
        }

        boolean wasActive = auction.getStatus() == AuctionStatus.ACTIVE;
        auction.setStatus(AuctionStatus.CANCELLED);
        auction = auctionRepository.save(auction);

        if (wasActive) {
            auctionEventProducer.sendAuctionEndedEvent(
                    com.duc.auction.dto.event.AuctionEndedEvent.builder()
                            .auctionId(auction.getId())
                            .build()
            );
        }

        return auctionMapper.toResponse(auction);
    }

    public AuctionResponse updateAuctionImage(String id, MultipartFile file) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getStatus() != AuctionStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_STATUS_UPDATE);
        }

        try {
            handleImageUpload(auction, file);
            auction = auctionRepository.save(auction);
            return auctionMapper.toResponse(auction);
        } catch (IOException e) {
            log.error("Failed to store uploaded image", e);
            throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED);
        }
    }

    private void handleImageUpload(Auction auction, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return;
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Nếu update thì xóa ảnh cũ
        if (auction.getImageUrl() != null && !auction.getImageUrl().isEmpty()) {
            try {
                String oldFilename = auction.getImageUrl().substring(auction.getImageUrl().lastIndexOf("/") + 1);
                Path oldFilePath = uploadPath.resolve(oldFilename);
                Files.deleteIfExists(oldFilePath);
                log.info("Deleted old image file: {}", oldFilePath);
            } catch (Exception e) {
                log.warn("Could not delete old image file", e);
            }
        }

        // Extract MD5 & Size
        String md5Checksum = DigestUtils.md5DigestAsHex(file.getInputStream());
        long size = file.getSize();
        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();

        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Dùng UUID để tránh trùng file
        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename);
        
        file.transferTo(filePath.toFile());

        String relativeUrl = "/images/" + filename;

        auction.setImageUrl(relativeUrl);
        auction.setImageMd5Checksum(md5Checksum);
        auction.setImageSize(size);
        auction.setImageFileType(contentType);
    }
}
