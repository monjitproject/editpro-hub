/**
 * Multi Images to PDF Tool
 * Combines multiple images into a single output (PDF-like HTML page or image strip).
 * Controls: select#multiPdfSize (Page size), multiple file input
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const multiPdfSize = document.getElementById('multiPdfSize');
  const imageList = document.getElementById('imageList');
  const noImages = document.getElementById('noImages');
  const addMoreBtn = document.getElementById('addMoreBtn');
  let images = [];
  let renderedCanvas = null;
  let originalFilename = 'combined';

  const zone = document.getElementById('upload-zone');
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) {
      input.addEventListener('change', e => {
        if (e.target.files && e.target.files.length > 0) {
          handleMultipleFiles(e.target.files);
        }
      });
    }
  }

  // Hidden file input for adding more
  let fileInput = null;

  function handleFile(file) {
    handleMultipleFiles([file]);
  }

  async function handleMultipleFiles(files) {
    let loaded = false;
    for (const file of files) {
      if (!Utils.isImageFile(file)) continue;
      loaded = true;
      try {
        const img = await Utils.loadImage(file);
        images.push({ img, name: file.name });
      } catch (err) {
        // skip invalid files
      }
    }
    if (!loaded) {
      Utils.showToast('Please select valid image files', 'error');
      return;
    }
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    updateImageList();
    processImage();
  }

  function updateImageList() {
    if (!imageList) return;
    imageList.innerHTML = '';
    if (images.length === 0) {
      if (noImages) noImages.style.display = 'block';
      return;
    }
    if (noImages) noImages.style.display = 'none';

    images.forEach((imgData, index) => {
      const item = document.createElement('div');
      item.className = 'image-list-item';
      item.innerHTML = `
        <span class="image-list-name">${imgData.name || `Image ${index + 1}`}</span>
        <span class="image-list-size">${imgData.img.naturalWidth}×${imgData.img.naturalHeight}</span>
        <button class="btn btn-sm btn-danger remove-img" data-index="${index}">&times;</button>
      `;
      const removeBtn = item.querySelector('.remove-img');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          images.splice(index, 1);
          updateImageList();
          processImage();
        });
      }
      imageList.appendChild(item);
    });
  }

  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => {
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', e => {
          if (e.target.files && e.target.files.length > 0) {
            handleMultipleFiles(e.target.files);
          }
        });
        document.body.appendChild(fileInput);
      }
      fileInput.click();
    });
  }

  function getPageSize(size) {
    const sizes = {
      A4: { w: 595, h: 842 },
      Letter: { w: 612, h: 792 },
      Legal: { w: 612, h: 1008 },
      'Fit to Image': { w: 0, h: 0 }
    };
    return sizes[size] || sizes.A4;
  }

  function processImage() {
    if (images.length === 0) return;

    const sizeKey = multiPdfSize ? multiPdfSize.value : 'A4';
    const pageSize = getPageSize(sizeKey);
    const isFit = sizeKey === 'Fit to Image';

    if (isFit && images.length === 1) {
      // Single image, just use its dimensions
      canvas.width = images[0].img.naturalWidth;
      canvas.height = images[0].img.naturalHeight;
      ctx.drawImage(images[0].img, 0, 0);
      renderedCanvas = canvas;
      return;
    }

    // Arrange images in a vertical strip for multi-image to PDF
    const maxW = isFit ? Math.max(...images.map(i => i.img.naturalWidth)) : pageSize.w;
    let totalH = 0;
    const gaps = images.length * 20; // gap between images

    // Calculate layout
    const arranged = images.map((imgData) => {
      const img = imgData.img;
      let drawW, drawH;
      if (isFit) {
        drawW = img.naturalWidth;
        drawH = img.naturalHeight;
      } else {
        const ratio = img.naturalWidth / img.naturalHeight;
        drawW = Math.min(maxW, pageSize.w - 40);
        drawH = drawW / ratio;
        if (totalH + drawH > pageSize.h - 40 && totalH > 0) {
          // Would exceed page, but we're doing vertical strip so just add
        }
      }
      return { img, drawW, drawH };
    });

    arranged.forEach(a => { totalH += a.drawH; });
    totalH += gaps;
    totalH = Math.max(totalH, 100);

    renderedCanvas = Utils.createCanvas(maxW + 40, totalH + 40);
    const rctx = renderedCanvas.getContext('2d');
    rctx.fillStyle = '#ffffff';
    rctx.fillRect(0, 0, renderedCanvas.width, renderedCanvas.height);

    let y = 20;
    arranged.forEach((a) => {
      const x = (renderedCanvas.width - a.drawW) / 2;
      rctx.drawImage(a.img, x, y, a.drawW, a.drawH);
      y += a.drawH + 20;
    });

    // Copy to preview
    canvas.width = renderedCanvas.width;
    canvas.height = renderedCanvas.height;
    ctx.drawImage(renderedCanvas, 0, 0);
  }

  if (multiPdfSize) multiPdfSize.addEventListener('change', processImage);

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (images.length === 0) {
      Utils.showToast('Please add at least one image', 'warning');
      return;
    }
    if (renderedCanvas) {
      Utils.downloadCanvas(renderedCanvas, originalFilename, 'png');
      Utils.showToast('Combined image downloaded', 'success');
    } else {
      Utils.downloadCanvas(canvas, originalFilename, 'png');
    }
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    images = [];
    renderedCanvas = null;
    originalFilename = 'combined';
    if (multiPdfSize) multiPdfSize.value = 'A4';
    if (noImages) noImages.style.display = 'block';
    if (imageList) imageList.innerHTML = '';
    canvas.width = 0;
    canvas.height = 0;
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    Utils.showToast('Tool reset', 'info');
  });
});
