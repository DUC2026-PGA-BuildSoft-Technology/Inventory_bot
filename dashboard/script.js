const state = {
    products: [],
    admins: [],
    editingProductId: null,
    uploadedImageUrl: null,
  };
  
  // DOM Elements
  const els = {
    // Mobile / Layout
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    openSidebarBtn: document.getElementById('openSidebarBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    
    // Dashboard
    totalProducts: document.getElementById('totalProducts'),
    lowStock: document.getElementById('lowStock'),
    outOfStock: document.getElementById('outOfStock'),
    totalAdmins: document.getElementById('totalAdmins'),
    
    // Tables
    productsTableBody: document.getElementById('productsTableBody'),
    adminsTableBody: document.getElementById('adminsTableBody'),
    
    // Modals
    productModal: document.getElementById('productModal'),
    adminModal: document.getElementById('adminModal'),
    productModalBackdrop: document.getElementById('productModalBackdrop'),
    adminModalBackdrop: document.getElementById('adminModalBackdrop'),
    productModalTitle: document.getElementById('productModalTitle'),
    
    // Buttons
    openModalBtn: document.getElementById('openModalBtn'),
    openAdminModalBtn: document.getElementById('openAdminModalBtn'),
    closeProductModalBtn: document.getElementById('closeProductModalBtn'),
    closeAdminModalBtn: document.getElementById('closeAdminModalBtn'),
    cancelProductBtn: document.getElementById('cancelProductBtn'),
    cancelAdminBtn: document.getElementById('cancelAdminBtn'),
    
    // Forms
    productForm: document.getElementById('productForm'),
    adminForm: document.getElementById('adminForm'),
    
    // Inputs (Products)
    productId: document.getElementById('productId'),
    productName: document.getElementById('productName'),
    barcode: document.getElementById('barcode'),
    category: document.getElementById('category'),
    color: document.getElementById('color'),
    size: document.getElementById('size'),
    stockQuantity: document.getElementById('stockQuantity'),
    price: document.getElementById('price'),
    status: document.getElementById('status'),
    productImageInput: document.getElementById('productImage'),
    imagePreviewBox: document.getElementById('imagePreviewBox'),
    
    // Inputs (Admins)
    adminFirstName: document.getElementById('adminFirstName'),
    adminLastName: document.getElementById('adminLastName'),
    adminUsername: document.getElementById('adminUsername'),
    adminTelegramId: document.getElementById('adminTelegramId'),
    adminRole: document.getElementById('adminRole'),
  };
  
  const navButtons = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.panel');
  
  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
  
  // Rendering Logic
  const renderOverview = (overview) => {
    els.totalProducts.textContent = overview.totalProducts;
    els.lowStock.textContent = overview.lowStock;
    els.outOfStock.textContent = overview.outOfStock;
    els.totalAdmins.textContent = overview.totalAdmins;
  };
  
  const renderProducts = () => {
    if (!state.products.length) {
      els.productsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 32px;">No products yet. Add your first SKU.</td></tr>';
      return;
    }
  
    els.productsTableBody.innerHTML = state.products.map((product) => `
      <tr>
        <td>
          <div class="product-cell">
            <img class="thumb" src="${product.image_url || 'https://via.placeholder.com/80'}" alt="${product.product_name}" />
            <div class="product-info">
              <h4>${product.product_name}</h4>
              <p>${product.category || 'Uncategorized'} • ${product.color || 'N/A'}</p>
            </div>
          </div>
        </td>
        <td><span style="font-family: monospace; color: var(--text-muted);">${product.barcode}</span></td>
        <td><strong>${product.stock_quantity}</strong></td>
        <td>${formatCurrency(product.price)}</td>
        <td><span class="badge ${product.status}">${product.status.replace('_', ' ')}</span></td>
        <td class="text-right">
          <div class="actions">
            <button class="icon-btn" data-action="edit" data-id="${product.id}">Edit</button>
            <button class="icon-btn danger" data-action="delete" data-id="${product.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  };
  
  const renderAdmins = () => {
    if (!state.admins.length) {
      els.adminsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 32px;">No admins yet.</td></tr>';
      return;
    }
  
    els.adminsTableBody.innerHTML = state.admins.map((admin) => `
      <tr>
        <td>
          <div style="font-weight: 500;">${admin.first_name || 'Admin'} ${admin.last_name || ''}</div>
          <div style="color: var(--text-muted); font-size: 0.85rem;">${admin.username || 'No username'}</div>
        </td>
        <td><span style="font-family: monospace;">${admin.telegram_id}</span></td>
        <td><span class="badge" style="background: var(--surface-highlight); color: var(--text-main);">${admin.role}</span></td>
        <td>${new Date(admin.created_at).toLocaleDateString()}</td>
        <td class="text-right">
          <div class="actions">
            <button class="icon-btn danger" data-admin-action="delete" data-id="${admin.id}">Remove</button>
          </div>
        </td>
      </tr>
    `).join('');
  };
  
  const loadData = async () => {
    try {
      const [overviewRes, productsRes, adminsRes] = await Promise.all([
        fetch('/api/overview'),
        fetch('/api/products'),
        fetch('/api/admins'),
      ]);
  
      const overview = await overviewRes.json();
      state.products = await productsRes.json();
      state.admins = await adminsRes.json();
      
      renderOverview(overview);
      renderProducts();
      renderAdmins();
    } catch (err) {
      console.error('Data loading error:', err);
    }
  };
  
  // Form Resets
  const resetProductForm = () => {
    els.productForm.reset();
    els.productId.value = '';
    els.productModalTitle.textContent = 'Add product';
    state.editingProductId = null;
    state.uploadedImageUrl = null;
    els.imagePreviewBox.innerHTML = '';
  };
  
  // Modal Controls
  const openProductModal = (product = null) => {
    resetProductForm();
    if (product) {
      els.productModalTitle.textContent = 'Edit product';
      els.productId.value = product.id;
      els.productName.value = product.product_name || '';
      els.barcode.value = product.barcode || '';
      els.category.value = product.category || '';
      els.color.value = product.color || '';
      els.size.value = product.size || '';
      els.stockQuantity.value = product.stock_quantity || 0;
      els.price.value = product.price || 0;
      els.status.value = product.status || 'active';
      state.editingProductId = product.id;
      state.uploadedImageUrl = product.image_url || null;
      
      if (product.image_url) {
        els.imagePreviewBox.innerHTML = `<img src="${product.image_url}" alt="preview" />`;
      }
    }
    els.productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };
  
  const closeProductModal = () => {
    els.productModal.classList.add('hidden');
    document.body.style.overflow = '';
    resetProductForm();
  };
  
  const openAdminModal = () => {
    els.adminForm.reset();
    els.adminModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };
  
  const closeAdminModal = () => {
    els.adminModal.classList.add('hidden');
    document.body.style.overflow = '';
    els.adminForm.reset();
  };
  
  // Image Upload Logic
  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Image read failed'));
    reader.readAsDataURL(file);
  });
  
  // Show preview immediately on file select
  els.productImageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = await fileToDataUrl(file);
      els.imagePreviewBox.innerHTML = `<img src="${previewUrl}" alt="local preview" />`;
    }
  });
  
  const uploadImageIfNeeded = async () => {
    const file = els.productImageInput.files?.[0];
    if (!file) {
      return state.uploadedImageUrl || null;
    }
  
    const imageBase64 = await fileToDataUrl(file);
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }
    return result.image_url;
  };
  
  // Form Submissions
  els.productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const submitBtn = event.submitter;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
  
    try {
      const imageUrl = await uploadImageIfNeeded();
      const payload = {
        barcode: els.barcode.value.trim(),
        product_name: els.productName.value.trim(),
        category: els.category.value.trim(),
        color: els.color.value.trim(),
        size: els.size.value.trim(),
        stock_quantity: Number(els.stockQuantity.value),
        price: Number(els.price.value),
        status: els.status.value,
        image_url: imageUrl,
      };
  
      const method = state.editingProductId ? 'PUT' : 'POST';
      const url = state.editingProductId ? `/api/products/${state.editingProductId}` : '/api/products';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unable to save product');
      }
  
      closeProductModal();
      await loadData();
    } catch (err) {
      alert(err.message || 'Unable to save product');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
  
  els.adminForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const submitBtn = event.submitter;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
  
    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: els.adminTelegramId.value.trim(),
          username: els.adminUsername.value.trim(),
          first_name: els.adminFirstName.value.trim(),
          last_name: els.adminLastName.value.trim(),
          role: els.adminRole.value,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unable to save admin');
      }
  
      closeAdminModal();
      await loadData();
    } catch (err) {
      alert(err.message || 'Unable to save admin');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
  
  // Table Delegations
  els.productsTableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    
    const id = button.getAttribute('data-id');
    const action = button.getAttribute('data-action');
  
    if (action === 'edit') {
      const product = state.products.find((item) => String(item.id) === String(id));
      if (product) openProductModal(product);
    }
  
    if (action === 'delete') {
      const confirmed = window.confirm('Are you sure you want to delete this product?');
      if (!confirmed) return;
      
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        await loadData();
      } catch (err) {
        alert('Error deleting product');
      }
    }
  });
  
  els.adminsTableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-admin-action]');
    if (!button) return;
    
    const id = button.getAttribute('data-id');
    const confirmed = window.confirm('Remove this admin access?');
    
    if (!confirmed) return;
    try {
      await fetch(`/api/admins/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      alert('Error deleting admin');
    }
  });
  
  // Navigation & Layout Logic
  const closeMobileSidebar = () => {
    els.sidebar.classList.remove('open');
    els.sidebarOverlay.classList.remove('active');
  };
  
  const openMobileSidebar = () => {
    els.sidebar.classList.add('open');
    els.sidebarOverlay.classList.add('active');
  };
  
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      navButtons.forEach((item) => item.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active-panel'));
      
      button.classList.add('active');
      document.getElementById(button.getAttribute('data-target')).classList.add('active-panel');
      
      if (window.innerWidth <= 960) closeMobileSidebar();
    });
  });
  
  // Event Listeners Registration
  els.openSidebarBtn.addEventListener('click', openMobileSidebar);
  els.closeSidebarBtn.addEventListener('click', closeMobileSidebar);
  els.sidebarOverlay.addEventListener('click', closeMobileSidebar);
  
  els.openModalBtn.addEventListener('click', () => openProductModal());
  els.openAdminModalBtn.addEventListener('click', openAdminModal);
  
  els.closeProductModalBtn.addEventListener('click', closeProductModal);
  els.cancelProductBtn.addEventListener('click', closeProductModal);
  els.productModalBackdrop.addEventListener('click', closeProductModal);
  
  els.closeAdminModalBtn.addEventListener('click', closeAdminModal);
  els.cancelAdminBtn.addEventListener('click', closeAdminModal);
  els.adminModalBackdrop.addEventListener('click', closeAdminModal);
  
  // Initialization
  window.addEventListener('DOMContentLoaded', loadData);