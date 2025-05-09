package com.TryCatch.NusaCart.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.TokoCreateDTO;
import com.TryCatch.NusaCart.dto.TokoDTO;
import com.TryCatch.NusaCart.dto.TokoUpdateDTO;
import com.TryCatch.NusaCart.entity.TokoEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.enums.UserRole;
import com.TryCatch.NusaCart.repository.TokoRepository;
import com.TryCatch.NusaCart.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TokoService {

    @Autowired
    private TokoRepository tokoRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    public TokoService(TokoRepository tokoRepository, UserRepository userRepository, UserService userService) {
        this.tokoRepository = tokoRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }
    
    // Get all stores
    public List<TokoDTO> getAllToko() {
        log.info("Getting all stores");
        return tokoRepository.findAll()
                .stream()
                .map(TokoDTO::new)
                .collect(Collectors.toList());
    }
        
        // Get paginated stores
        public Map<String, Object> getPaginatedToko(int page, int size) {
            log.info("Getting paginated stores with page: {} and size: {}", page, size);
            
            // Use entityManager for native pagination since the custom query doesn't work properly
            List<TokoEntity> stores = tokoRepository.findAll().stream()
                    .skip(page * size)
                    .limit(size)
                    .collect(Collectors.toList());
            
            // Get total count
            long totalCount = tokoRepository.count();
            
            // Calculate total pages
            int totalPages = (int) Math.ceil((double) totalCount / size);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("content", stores.stream().map(TokoDTO::new).collect(Collectors.toList()));
            response.put("currentPage", page);
            response.put("totalItems", totalCount);
            response.put("totalPages", totalPages);
            response.put("size", size);
            
            return response;
        }
    
    // Get store by ID
    public TokoDTO getTokoById(Integer idToko) {
        log.info("Getting store with ID: {}", idToko);
        TokoEntity toko = tokoRepository.findByIdToko(idToko)
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + idToko));
        return new TokoDTO(toko);
    }
    
    // Get stores by seller
    public List<TokoDTO> getTokoByCurrentSeller() {
        UserEntity currentUser = userService.getCurrentUser();
        log.info("Getting stores for seller: {}", currentUser.getUserId());
        
        return tokoRepository.findBySeller(currentUser)
                .stream()
                .map(TokoDTO::new)
                .collect(Collectors.toList());
    }
    
    // Search stores by name
    public List<TokoDTO> searchTokoByName(String namaToko) {
        log.info("Searching stores with name containing: {}", namaToko);
        return tokoRepository.findByNamaTokoContainingIgnoreCase(namaToko)
                .stream()
                .map(TokoDTO::new)
                .collect(Collectors.toList());
    }
        
        // Search stores by name with pagination
        public Map<String, Object> searchTokoByNamePaginated(String namaToko, int page, int size) {
            log.info("Searching paginated stores with name containing: {} (page: {}, size: {})", namaToko, page, size);
            
            // Get all matching stores first
            List<TokoEntity> allMatchingStores = tokoRepository.findByNamaTokoContainingIgnoreCase(namaToko);
            
            // Calculate total count
            long totalCount = allMatchingStores.size();
            
            // Apply pagination manually
            List<TokoDTO> paginatedStores = allMatchingStores.stream()
                    .skip(page * size)
                    .limit(size)
                    .map(TokoDTO::new)
                    .collect(Collectors.toList());
            
            // Calculate total pages
            int totalPages = (int) Math.ceil((double) totalCount / size);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("content", paginatedStores);
            response.put("currentPage", page);
            response.put("totalItems", totalCount);
            response.put("totalPages", totalPages);
            response.put("size", size);
            response.put("searchTerm", namaToko);
            
            return response;
        }
    
    // Create a new store
    @Transactional
    public TokoDTO createToko(TokoCreateDTO tokoCreateDTO) {
        UserEntity currentUser = userService.getCurrentUser();
        log.info("Creating store for user: {}", currentUser.getEmail());
        
        // Check if the user has the SELLER role
        if (!currentUser.getRoles().contains(UserRole.SELLER)) {
            currentUser.addRole(UserRole.SELLER);
            userRepository.save(currentUser);
            log.info("Added SELLER role to user: {}", currentUser.getEmail());
        }
        
        // Check if store name already exists
        if (tokoRepository.existsByNamaToko(tokoCreateDTO.getNamaToko())) {
            throw new IllegalArgumentException("Nama toko sudah digunakan");
        }
        
        // Check if email already exists
        if (tokoRepository.existsByEmailToko(tokoCreateDTO.getEmailToko())) {
            throw new IllegalArgumentException("Email toko sudah digunakan");
        }
        
        TokoEntity toko = new TokoEntity();
        toko.setNamaToko(tokoCreateDTO.getNamaToko());
        toko.setDeskripsiToko(tokoCreateDTO.getDeskripsiToko());
        toko.setAlamatToko(tokoCreateDTO.getAlamatToko());
        toko.setSeller(currentUser);
        toko.setNoTelpToko(tokoCreateDTO.getNoTelpToko());
        toko.setEmailToko(tokoCreateDTO.getEmailToko());
        toko.setProfilePictureToko(tokoCreateDTO.getProfilePictureToko());
        
        TokoEntity savedToko = tokoRepository.save(toko);
        log.info("Store created with ID: {}", savedToko.getIdToko());
        
        return new TokoDTO(savedToko);
    }
    
    // Update a store
    @Transactional
    public TokoDTO updateToko(Integer idToko, TokoUpdateDTO tokoUpdateDTO) {
        UserEntity currentUser = userService.getCurrentUser();
        log.info("Updating store with ID: {} by user: {}", idToko, currentUser.getEmail());
        
        TokoEntity toko = tokoRepository.findByIdToko(idToko)
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + idToko));
        
        // Check if the current user is the owner of the store
        if (!toko.getSeller().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("Tidak dapat mengupdate toko milik orang lain");
        }
        
        // Check if trying to change to a name that already exists
        if (tokoUpdateDTO.getNamaToko() != null && 
            !toko.getNamaToko().equals(tokoUpdateDTO.getNamaToko()) && 
            tokoRepository.existsByNamaToko(tokoUpdateDTO.getNamaToko())) {
            throw new IllegalArgumentException("Nama toko sudah digunakan");
        }
        
        // Check if trying to change to an email that already exists
        if (tokoUpdateDTO.getEmailToko() != null && 
            !toko.getEmailToko().equals(tokoUpdateDTO.getEmailToko()) && 
            tokoRepository.existsByEmailToko(tokoUpdateDTO.getEmailToko())) {
            throw new IllegalArgumentException("Email toko sudah digunakan");
        }
        
        // Update fields if they're not null
        if (tokoUpdateDTO.getNamaToko() != null) {
            toko.setNamaToko(tokoUpdateDTO.getNamaToko());
        }
        
        if (tokoUpdateDTO.getDeskripsiToko() != null) {
            toko.setDeskripsiToko(tokoUpdateDTO.getDeskripsiToko());
        }
        
        if (tokoUpdateDTO.getAlamatToko() != null) {
            toko.setAlamatToko(tokoUpdateDTO.getAlamatToko());
        }
        
        if (tokoUpdateDTO.getNoTelpToko() != null) {
            toko.setNoTelpToko(tokoUpdateDTO.getNoTelpToko());
        }
        
        if (tokoUpdateDTO.getEmailToko() != null) {
            toko.setEmailToko(tokoUpdateDTO.getEmailToko());
        }
        
        if (tokoUpdateDTO.getProfilePictureToko() != null) {
            toko.setProfilePictureToko(tokoUpdateDTO.getProfilePictureToko());
        }
        
        toko.setUpdatedAt(LocalDateTime.now());
        
        TokoEntity updatedToko = tokoRepository.save(toko);
        log.info("Store updated: {}", updatedToko.getIdToko());
        
        return new TokoDTO(updatedToko);
    }
    
    // Delete a store
    @Transactional
    public Map<String, String> deleteToko(Integer idToko) {
        UserEntity currentUser = userService.getCurrentUser();
        log.info("Deleting store with ID: {} by user: {}", idToko, currentUser.getEmail());
        
        TokoEntity toko = tokoRepository.findByIdToko(idToko)
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + idToko));
        
        // Check if the current user is the owner of the store
        if (!toko.getSeller().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("Tidak dapat menghapus toko milik orang lain");
        }
        
        tokoRepository.delete(toko);
        log.info("Store deleted: {}", idToko);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Toko berhasil dihapus");
        return response;
    }
}
