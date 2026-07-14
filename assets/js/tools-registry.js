/* ============================================
   EditPro Hub — Tools Registry
   Complete list of all ~100 tools
   ============================================ */

const TOOLS_REGISTRY = [
  // ── Category A: Image Editing & Adjustment ──
  { id: 'brightness', name: 'Image Brightness Adjuster', desc: 'Adjust image brightness instantly with a simple slider', category: 'image-editing', icon: '☀️', popular: true, url: '/tools/image-editing/brightness.html' },
  { id: 'contrast', name: 'Contrast Adjuster', desc: 'Enhance or reduce image contrast for better visibility', category: 'image-editing', icon: '◐', url: '/tools/image-editing/contrast.html' },
  { id: 'saturation', name: 'Saturation Adjuster', desc: 'Control color intensity in your images', category: 'image-editing', icon: '🎨', url: '/tools/image-editing/saturation.html' },
  { id: 'hue', name: 'Hue Rotator', desc: 'Shift colors in your image by rotating the hue wheel', category: 'image-editing', icon: '🔄', url: '/tools/image-editing/hue.html' },
  { id: 'grayscale', name: 'Grayscale Converter', desc: 'Convert any image to grayscale instantly', category: 'image-editing', icon: '⬛', url: '/tools/image-editing/grayscale.html' },
  { id: 'sepia', name: 'Sepia Filter', desc: 'Add a warm vintage sepia tone to photos', category: 'image-editing', icon: '🟤', url: '/tools/image-editing/sepia.html' },
  { id: 'invert', name: 'Invert Colors', desc: 'Invert all colors in an image for a negative effect', category: 'image-editing', icon: '🔀', url: '/tools/image-editing/invert.html' },
  { id: 'blur', name: 'Blur Tool', desc: 'Apply adjustable blur effect to images', category: 'image-editing', icon: '🌫️', popular: true, url: '/tools/image-editing/blur.html' },
  { id: 'sharpen', name: 'Sharpen Tool', desc: 'Enhance image sharpness and detail', category: 'image-editing', icon: '🔍', url: '/tools/image-editing/sharpen.html' },
  { id: 'pixelate', name: 'Image Pixelator', desc: 'Create pixel art effect by pixelating your images', category: 'image-editing', icon: '🟩', url: '/tools/image-editing/pixelate.html' },
  { id: 'vignette', name: 'Vignette Effect', desc: 'Add a classic vignette darkening around image edges', category: 'image-editing', icon: '🔲', url: '/tools/image-editing/vignette.html' },
  { id: 'opacity', name: 'Opacity/Transparency', desc: 'Adjust image opacity and transparency levels', category: 'image-editing', icon: '👁️', url: '/tools/image-editing/opacity.html' },
  { id: 'duotone', name: 'Duotone Effect', desc: 'Create stunning duotone effects with custom color pairs', category: 'image-editing', icon: '🎭', url: '/tools/image-editing/duotone.html' },
  { id: 'color-balance', name: 'Color Balance Tool', desc: 'Fine-tune red, green, and blue color channels', category: 'image-editing', icon: '⚖️', url: '/tools/image-editing/color-balance.html' },
  { id: 'exposure', name: 'Exposure Adjuster', desc: 'Simulate camera exposure adjustment on your photos', category: 'image-editing', icon: '📸', url: '/tools/image-editing/exposure.html' },
  { id: 'warmth', name: 'Warmth/Temperature', desc: 'Make images warmer (orange) or cooler (blue)', category: 'image-editing', icon: '🌡️', url: '/tools/image-editing/warmth.html' },
  { id: 'vintage', name: 'Vintage Filter', desc: 'Apply a nostalgic vintage film look to photos', category: 'image-editing', icon: '📽️', url: '/tools/image-editing/vintage.html' },
  { id: 'bw', name: 'Black & White Converter', desc: 'High-quality black and white conversion with control', category: 'image-editing', icon: '⬜', url: '/tools/image-editing/bw.html' },
  { id: 'noise', name: 'Noise Reducer', desc: 'Reduce image noise and grain for cleaner photos', category: 'image-editing', icon: '📡', url: '/tools/image-editing/noise.html' },
  { id: 'posterize', name: 'Threshold/Posterize', desc: 'Reduce colors and create posterized art effects', category: 'image-editing', icon: '🎯', url: '/tools/image-editing/posterize.html' },

  // ── Category B: Cropping, Cutting & Resizing ──
  { id: 'cropper', name: 'Image Cropper', desc: 'Freeform crop images to any size or shape', category: 'cropping-resizing', icon: '✂️', popular: true, url: '/tools/cropping-resizing/cropper.html' },
  { id: 'square-crop', name: 'Square Crop Tool', desc: 'Crop images to a perfect 1:1 square', category: 'cropping-resizing', icon: '⬜', url: '/tools/cropping-resizing/square-crop.html' },
  { id: 'circle-crop', name: 'Circle Crop Tool', desc: 'Crop images into a perfect circle', category: 'cropping-resizing', icon: '⭕', url: '/tools/cropping-resizing/circle-crop.html' },
  { id: 'aspect-ratio-crop', name: 'Aspect Ratio Crop', desc: 'Crop with presets for 1:1, 4:5, 16:9, 9:16 and more', category: 'cropping-resizing', icon: '📐', popular: true, url: '/tools/cropping-resizing/aspect-ratio-crop.html' },
  { id: 'resizer-px', name: 'Image Resizer (Pixels)', desc: 'Resize images to exact pixel dimensions', category: 'cropping-resizing', icon: '📏', popular: true, url: '/tools/cropping-resizing/resizer-px.html' },
  { id: 'resizer-pct', name: 'Image Resizer (%)', desc: 'Scale images up or down by percentage', category: 'cropping-resizing', icon: '📊', url: '/tools/cropping-resizing/resizer-pct.html' },
  { id: 'bulk-resize', name: 'Bulk Image Resizer', desc: 'Resize multiple images at once to the same dimensions', category: 'cropping-resizing', icon: '📦', url: '/tools/cropping-resizing/bulk-resize.html' },
  { id: 'bg-eraser', name: 'Background Eraser', desc: 'Manually erase image backgrounds with brush tool', category: 'cropping-resizing', icon: '🧹', popular: true, url: '/tools/cropping-resizing/bg-eraser.html' },
  { id: 'grid-cutter', name: 'Image Cutter (Grid)', desc: 'Slice images into a grid of equal tiles', category: 'cropping-resizing', icon: '🔲', url: '/tools/cropping-resizing/grid-cutter.html' },
  { id: 'passport-photo', name: 'Passport Photo Maker', desc: 'Create passport-size photos with proper dimensions', category: 'cropping-resizing', icon: '🪪', url: '/tools/cropping-resizing/passport-photo.html' },
  { id: 'social-resizer', name: 'Social Media Resizer', desc: 'Resize images for Instagram, Facebook, Twitter & more', category: 'cropping-resizing', icon: '📱', popular: true, url: '/tools/cropping-resizing/social-resizer.html' },
  { id: 'banner-resizer', name: 'Banner/Cover Resizer', desc: 'Resize banners and cover photos for any platform', category: 'cropping-resizing', icon: '🖼️', url: '/tools/cropping-resizing/banner-resizer.html' },
  { id: 'auto-trim', name: 'Image Trimmer', desc: 'Auto-crop whitespace and empty borders from images', category: 'cropping-resizing', icon: '🎗️', url: '/tools/cropping-resizing/auto-trim.html' },
  { id: 'collage-maker', name: 'Collage Maker', desc: 'Combine multiple photos into a beautiful collage', category: 'cropping-resizing', icon: '🧩', url: '/tools/cropping-resizing/collage-maker.html' },
  { id: 'image-splitter', name: 'Image Splitter', desc: 'Split an image into N equal tiles or custom sections', category: 'cropping-resizing', icon: '🔀', url: '/tools/cropping-resizing/image-splitter.html' },

  // ── Category C: Rotation, Flip & Transform ──
  { id: 'rotator', name: 'Image Rotator', desc: 'Rotate images by 90°, 180°, or 270° instantly', category: 'rotation-transform', icon: '🔃', popular: true, url: '/tools/rotation-transform/rotator.html' },
  { id: 'free-rotate', name: 'Free-Angle Rotator', desc: 'Rotate images by any custom angle', category: 'rotation-transform', icon: '🎠', url: '/tools/rotation-transform/free-rotate.html' },
  { id: 'h-flip', name: 'Horizontal Flip', desc: 'Mirror images horizontally (left to right)', category: 'rotation-transform', icon: '↔️', url: '/tools/rotation-transform/h-flip.html' },
  { id: 'v-flip', name: 'Vertical Flip', desc: 'Flip images vertically (top to bottom)', category: 'rotation-transform', icon: '↕️', url: '/tools/rotation-transform/v-flip.html' },
  { id: 'perspective', name: 'Perspective/Skew Tool', desc: 'Apply perspective and skew transformations', category: 'rotation-transform', icon: '🔳', url: '/tools/rotation-transform/perspective.html' },
  { id: 'straighten', name: 'Image Straightener', desc: 'Straighten crooked photos and horizons', category: 'rotation-transform', icon: '📏', url: '/tools/rotation-transform/straighten.html' },
  { id: 'canvas-padding', name: 'Canvas Resizer/Padding', desc: 'Add or remove padding around images', category: 'rotation-transform', icon: '🔲', url: '/tools/rotation-transform/canvas-padding.html' },
  { id: 'auto-orient', name: 'Auto-Orient (EXIF Fix)', desc: 'Fix image orientation based on EXIF data', category: 'rotation-transform', icon: '🧭', url: '/tools/rotation-transform/auto-orient.html' },
  { id: 'mirror', name: 'Mirror Effect', desc: 'Create beautiful mirror reflections of images', category: 'rotation-transform', icon: '🪞', url: '/tools/rotation-transform/mirror.html' },
  { id: 'tilt-3d', name: '3D Tilt Preview', desc: 'Preview images with a 3D tilt and perspective effect', category: 'rotation-transform', icon: '🎲', url: '/tools/rotation-transform/tilt-3d.html' },

  // ── Category D: Text & Typography Tools ──
  { id: 'text-on-image', name: 'Text on Image', desc: 'Add captions, titles, and watermarks to images', category: 'text-tools', icon: '📝', popular: true, url: '/tools/text-tools/text-on-image.html' },
  { id: 'meme-generator', name: 'Meme Generator', desc: 'Create viral memes with custom text on any image', category: 'text-tools', icon: '😂', popular: true, url: '/tools/text-tools/meme-generator.html' },
  { id: 'word-counter', name: 'Word Counter', desc: 'Count words, characters, sentences, and paragraphs', category: 'text-tools', icon: '🔢', url: '/tools/text-tools/word-counter.html' },
  { id: 'char-counter', name: 'Character Counter', desc: 'Count characters with and without spaces', category: 'text-tools', icon: '#️⃣', url: '/tools/text-tools/char-counter.html' },
  { id: 'case-converter', name: 'Case Converter', desc: 'Convert text to UPPER, lower, Title, or Sentence case', category: 'text-tools', icon: '🔡', url: '/tools/text-tools/case-converter.html' },
  { id: 'text-reverser', name: 'Text Reverser', desc: 'Reverse any text string character by character', category: 'text-tools', icon: '🔃', url: '/tools/text-tools/text-reverser.html' },
  { id: 'duplicate-remover', name: 'Duplicate Line Remover', desc: 'Remove duplicate lines from text instantly', category: 'text-tools', icon: '🧹', url: '/tools/text-tools/duplicate-remover.html' },
  { id: 'slug-converter', name: 'Text to Slug', desc: 'Convert text to URL-friendly slug format', category: 'text-tools', icon: '🔗', url: '/tools/text-tools/slug-converter.html' },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', desc: 'Generate placeholder text for design mockups', category: 'text-tools', icon: '📄', url: '/tools/text-tools/lorem-ipsum.html' },
  { id: 'text-diff', name: 'Text Diff Checker', desc: 'Compare two texts and highlight differences', category: 'text-tools', icon: '🔍', url: '/tools/text-tools/text-diff.html' },
  { id: 'text-sorter', name: 'Text Sorter', desc: 'Sort lines of text alphabetically or numerically', category: 'text-tools', icon: '📋', url: '/tools/text-tools/text-sorter.html' },
  { id: 'text-formatter', name: 'Text Formatter', desc: 'Clean and format text with proper spacing and line breaks', category: 'text-tools', icon: '✨', url: '/tools/text-tools/text-formatter.html' },
  { id: 'whitespace-remover', name: 'Whitespace Remover', desc: 'Remove extra spaces, tabs, and line breaks', category: 'text-tools', icon: '🗑️', url: '/tools/text-tools/whitespace-remover.html' },
  { id: 'encoder-decoder', name: 'Text Encoder/Decoder', desc: 'Encode and decode text in Base64 and URL formats', category: 'text-tools', icon: '🔐', url: '/tools/text-tools/encoder-decoder.html' },
  { id: 'binary-ascii', name: 'Binary/ASCII Converter', desc: 'Convert text to binary and ASCII representations', category: 'text-tools', icon: '💻', url: '/tools/text-tools/binary-ascii.html' },

  // ── Category E: Image Conversion & Compression ──
  { id: 'format-converter', name: 'Format Converter', desc: 'Convert between PNG, JPG, WEBP, and more', category: 'conversion-compression', icon: '🔄', popular: true, url: '/tools/conversion-compression/format-converter.html' },
  { id: 'compressor', name: 'Image Compressor', desc: 'Reduce image file size while maintaining quality', category: 'conversion-compression', icon: '📦', popular: true, url: '/tools/conversion-compression/compressor.html' },
  { id: 'to-base64', name: 'Image to Base64', desc: 'Convert images to Base64 encoded strings', category: 'conversion-compression', icon: '🔤', url: '/tools/conversion-compression/to-base64.html' },
  { id: 'from-base64', name: 'Base64 to Image', desc: 'Decode Base64 strings back into viewable images', category: 'conversion-compression', icon: '🖼️', url: '/tools/conversion-compression/from-base64.html' },
  { id: 'png-to-jpg', name: 'PNG to JPG', desc: 'Convert PNG images to JPG format with quality control', category: 'conversion-compression', icon: '📷', url: '/tools/conversion-compression/png-to-jpg.html' },
  { id: 'jpg-to-png', name: 'JPG to PNG', desc: 'Convert JPG images to PNG format with transparency support', category: 'conversion-compression', icon: '🏞️', url: '/tools/conversion-compression/jpg-to-png.html' },
  { id: 'to-pdf', name: 'Image to PDF', desc: 'Convert single or multiple images into PDF documents', category: 'conversion-compression', icon: '📑', url: '/tools/conversion-compression/to-pdf.html' },
  { id: 'multi-to-pdf', name: 'Multiple Images to PDF', desc: 'Combine multiple images into a single PDF file', category: 'conversion-compression', icon: '📚', url: '/tools/conversion-compression/multi-to-pdf.html' },
  { id: 'dpi-changer', name: 'Image DPI Changer', desc: 'Change image DPI/PPI for print or web use', category: 'conversion-compression', icon: '🖨️', url: '/tools/conversion-compression/dpi-changer.html' },
  { id: 'file-reducer', name: 'File Size Reducer', desc: 'Reduce image file size to meet upload requirements', category: 'conversion-compression', icon: '📉', url: '/tools/conversion-compression/file-reducer.html' },
  { id: 'svg-to-png', name: 'SVG to PNG', desc: 'Convert SVG vector graphics to PNG raster images', category: 'conversion-compression', icon: '📊', url: '/tools/conversion-compression/svg-to-png.html' },
  { id: 'favicon-gen', name: 'Favicon Generator', desc: 'Generate favicons in all required sizes from any image', category: 'conversion-compression', icon: '⭐', url: '/tools/conversion-compression/favicon-gen.html' },

  // ── Category F: Color Tools ──
  { id: 'color-picker-img', name: 'Color Picker from Image', desc: 'Pick any color from an image and get its code', category: 'color-tools', icon: '💉', popular: true, url: '/tools/color-tools/color-picker-img.html' },
  { id: 'color-converter', name: 'HEX/RGB/HSL Converter', desc: 'Convert between HEX, RGB, and HSL color formats', category: 'color-tools', icon: '🎨', url: '/tools/color-tools/color-converter.html' },
  { id: 'palette-extractor', name: 'Palette from Image', desc: 'Extract dominant color palettes from any image', category: 'color-tools', icon: '🌈', url: '/tools/color-tools/palette-extractor.html' },
  { id: 'gradient-gen', name: 'Gradient Generator', desc: 'Create custom CSS gradients with visual preview', category: 'color-tools', icon: '🌅', popular: true, url: '/tools/color-tools/gradient-gen.html' },
  { id: 'contrast-checker', name: 'Contrast Checker', desc: 'Check text/background contrast for accessibility (WCAG)', category: 'color-tools', icon: '♿', url: '/tools/color-tools/contrast-checker.html' },
  { id: 'random-color', name: 'Random Color Generator', desc: 'Generate beautiful random colors and palettes', category: 'color-tools', icon: '🎲', url: '/tools/color-tools/random-color.html' },
  { id: 'color-blender', name: 'Color Blender/Mixer', desc: 'Mix two colors and get intermediate shades', category: 'color-tools', icon: '🧪', url: '/tools/color-tools/color-blender.html' },
  { id: 'complementary', name: 'Complementary Colors', desc: 'Find complementary, analogous, and triadic colors', category: 'color-tools', icon: '🔄', url: '/tools/color-tools/complementary.html' },
  { id: 'dominant-color', name: 'Dominant Color Extractor', desc: 'Find the most dominant colors in any image', category: 'color-tools', icon: '🎯', url: '/tools/color-tools/dominant-color.html' },
  { id: 'css-gradient', name: 'CSS Gradient Code', desc: 'Generate copy-ready CSS gradient code with preview', category: 'color-tools', icon: '💻', url: '/tools/color-tools/css-gradient.html' },

  // ── Category G: Design & Creative Tools ──
  { id: 'qr-gen', name: 'QR Code Generator', desc: 'Generate QR codes for URLs, text, and contact info', category: 'design-creative', icon: '📱', popular: true, url: '/tools/design-creative/qr-gen.html' },
  { id: 'barcode-gen', name: 'Barcode Generator', desc: 'Generate barcodes in various formats (Code128, EAN, etc.)', category: 'design-creative', icon: '📊', url: '/tools/design-creative/barcode-gen.html' },
  { id: 'watermark', name: 'Watermark Adder', desc: 'Add text or image watermarks to protect your photos', category: 'design-creative', icon: '💧', url: '/tools/design-creative/watermark.html' },
  { id: 'signature', name: 'Signature Maker', desc: 'Draw or upload your signature for documents', category: 'design-creative', icon: '✍️', url: '/tools/design-creative/signature.html' },
  { id: 'border-frame', name: 'Border/Frame Adder', desc: 'Add decorative borders and frames to images', category: 'design-creative', icon: '🖼️', url: '/tools/design-creative/border-frame.html' },
  { id: 'sticker-overlay', name: 'Sticker/Emoji Overlay', desc: 'Add stickers and emoji overlays to your photos', category: 'design-creative', icon: '😊', url: '/tools/design-creative/sticker-overlay.html' },
  { id: 'photo-grid', name: 'Photo Grid/Layout', desc: 'Arrange photos in beautiful grid layouts', category: 'design-creative', icon: '⊞', url: '/tools/design-creative/photo-grid.html' },
  { id: 'biz-card', name: 'Business Card Template', desc: 'Create business card templates with proper dimensions', category: 'design-creative', icon: '💼', url: '/tools/design-creative/biz-card.html' },
  { id: 'rounded-corners', name: 'Rounded Corners', desc: 'Add rounded corners to images with adjustable radius', category: 'design-creative', icon: '🔲', url: '/tools/design-creative/rounded-corners.html' },
  { id: 'bg-changer', name: 'ID Photo BG Changer', desc: 'Change ID photo background to solid colors', category: 'design-creative', icon: '🪪', url: '/tools/design-creative/bg-changer.html' },

  // ── Category H: Utility & Misc Tools ──
  { id: 'exif-viewer', name: 'EXIF Data Viewer', desc: 'View and remove EXIF metadata from images', category: 'utility-misc', icon: '📋', url: '/tools/utility-misc/exif-viewer.html' },
  { id: 'screenshot-beautifier', name: 'Screenshot Beautifier', desc: 'Add browser frame and shadow to screenshots', category: 'utility-misc', icon: '📸', url: '/tools/utility-misc/screenshot-beautifier.html' },
  { id: 'compare-slider', name: 'Image Comparison', desc: 'Compare two images with an interactive slider', category: 'utility-misc', icon: '↔️', url: '/tools/utility-misc/compare-slider.html' },
  { id: 'file-calculator', name: 'File Size Calculator', desc: 'Calculate file sizes for images at different settings', category: 'utility-misc', icon: '🧮', url: '/tools/utility-misc/file-calculator.html' },
  { id: 'aspect-calculator', name: 'Aspect Ratio Calculator', desc: 'Calculate and find equivalent aspect ratios', category: 'utility-misc', icon: '📐', url: '/tools/utility-misc/aspect-calculator.html' },
  { id: 'px-converter', name: 'Pixel to Unit Converter', desc: 'Convert between pixels, centimeters, inches, and more', category: 'utility-misc', icon: '📏', url: '/tools/utility-misc/px-converter.html' },
  { id: 'meta-stripper', name: 'Metadata Stripper', desc: 'Remove all metadata from images for privacy', category: 'utility-misc', icon: '🔒', url: '/tools/utility-misc/meta-stripper.html' },
  { id: 'clipboard-paste', name: 'Clipboard Image Tool', desc: 'Paste images from clipboard and edit or convert them', category: 'utility-misc', icon: '📋', url: '/tools/utility-misc/clipboard-paste.html' }
];

const CATEGORIES = [
  { id: 'image-editing', name: 'Image Editing & Adjustment', icon: '🎨', color: '#fbbf24', desc: 'Adjust brightness, contrast, colors, and apply filters' },
  { id: 'cropping-resizing', name: 'Cropping, Cutting & Resizing', icon: '✂️', color: '#10b981', desc: 'Crop, resize, and cut images to perfect dimensions' },
  { id: 'rotation-transform', name: 'Rotation, Flip & Transform', icon: '🔄', color: '#3b82f6', desc: 'Rotate, flip, and apply transformations to images' },
  { id: 'text-tools', name: 'Text & Typography', icon: '📝', color: '#ec4899', desc: 'Text editing, counting, formatting, and generation tools' },
  { id: 'conversion-compression', name: 'Conversion & Compression', icon: '🔄', color: '#8b5cf6', desc: 'Convert formats, compress files, and optimize images' },
  { id: 'color-tools', name: 'Color Tools', icon: '🌈', color: '#14b8a6', desc: 'Color picking, conversion, palettes, and gradients' },
  { id: 'design-creative', name: 'Design & Creative', icon: '🎯', color: '#ef4444', desc: 'QR codes, watermarks, stickers, and design tools' },
  { id: 'utility-misc', name: 'Utility & Misc', icon: '🧰', color: '#64748b', desc: 'EXIF data, comparisons, converters, and utilities' }
];

const CAT_CLASS_MAP = {
  'image-editing': 'cat-image',
  'cropping-resizing': 'cat-crop',
  'rotation-transform': 'cat-rotate',
  'text-tools': 'cat-text',
  'conversion-compression': 'cat-convert',
  'color-tools': 'cat-color',
  'design-creative': 'cat-design',
  'utility-misc': 'cat-utility'
};
