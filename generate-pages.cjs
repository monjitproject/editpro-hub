/**
 * EditPro Hub — Page Generator Script
 * Generates all ~100 tool HTML pages from templates
 * Run: node generate-pages.js
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.dirname(__filename || __dirname);

// ── Tool Definitions ──
const TOOLS = [
  // Category A: Image Editing & Adjustment
  { id: 'brightness', name: 'Image Brightness Adjuster', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '☀️', popular: true,
    desc: 'Adjust the brightness of any image instantly with our free online brightness adjuster tool. Simply upload your image, move the slider, and download the result.',
    features: ['Real-time brightness preview', 'Slider control from -100 to +100', 'Supports PNG, JPG, WEBP formats', 'No file upload to servers — 100% private', 'Download in original quality'],
    faq: [
      ['What image formats are supported?', 'Our brightness adjuster supports all major web image formats including PNG, JPG/JPEG, WEBP, GIF, and BMP.'],
      ['Is my image uploaded to a server?', 'No. All processing happens directly in your browser using HTML5 Canvas. Your image never leaves your device.'],
      ['Will adjusting brightness reduce quality?', 'Brightness adjustment modifies pixel values directly. We preserve the original resolution and format quality.'],
      ['Can I adjust brightness of large images?', 'Yes, though very large images (over 5000px) may take a moment to process on older devices.']
    ],
    jsFile: 'brightness.js',
    controls: [{ type: 'range', id: 'brightness', label: 'Brightness', min: -100, max: 100, value: 0, unit: '' }]
  },
  { id: 'contrast', name: 'Contrast Adjuster', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '◐',
    desc: 'Enhance or reduce the contrast of your images with this free online contrast adjustment tool. Perfect for making photos more vivid or creating subtle effects.',
    features: ['Precise contrast control slider', 'Real-time preview of changes', 'Maintains image resolution', 'Works with all major formats', 'One-click download'],
    faq: [
      ['What does contrast do?', 'Contrast adjusts the difference between the light and dark areas of an image. Higher contrast makes whites brighter and blacks darker.'],
      ['Can I undo changes?', 'Yes, simply move the slider back to 0 or click Reset to return to the original image.'],
      ['Does this work on mobile?', 'Absolutely. The tool is fully responsive and works on any device with a modern browser.']
    ],
    jsFile: 'contrast.js',
    controls: [{ type: 'range', id: 'contrast', label: 'Contrast', min: -100, max: 100, value: 0, unit: '' }]
  },
  { id: 'saturation', name: 'Saturation Adjuster', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🎨',
    desc: 'Control the color intensity of your images with our free saturation adjuster. Make colors pop or create muted tones with a simple slider.',
    features: ['Adjustable saturation from grayscale to vivid', 'Real-time visual feedback', 'No quality loss during processing', 'Browser-based — fully private', 'Works on mobile and desktop'],
    faq: [
      ['What is saturation?', 'Saturation controls the intensity of colors in an image. At 0%, the image is grayscale; at higher values, colors become more vivid.'],
      ['Can I desaturate completely?', 'Yes, set the slider to the minimum value to create a grayscale effect.'],
      ['Will this affect skin tones?', 'Saturation affects all colors proportionally. Moderate adjustments usually look natural on skin tones.']
    ],
    jsFile: 'saturation.js',
    controls: [{ type: 'range', id: 'saturation', label: 'Saturation', min: -100, max: 100, value: 0, unit: '' }]
  },
  { id: 'hue', name: 'Hue Rotator', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🔄',
    desc: 'Shift and rotate the colors of your image using our free hue rotation tool. Create unique color effects by rotating the entire color wheel.',
    features: ['Full 360° hue rotation', 'Smooth color transitions', 'Instant preview', 'Supports all image formats', 'One-click download'],
    faq: [
      ['What does hue rotation do?', 'Hue rotation shifts all colors in your image around the color wheel. For example, rotating 180° swaps complementary colors.'],
      ['Can I create specific color effects?', 'Yes! Common effects include making blue skies look purple (+60°) or creating infrared-style effects (+120°).'],
      ['Does rotation affect image quality?', 'No. Hue rotation is a mathematical transformation that preserves image detail and resolution.']
    ],
    jsFile: 'hue.js',
    controls: [{ type: 'range', id: 'hue', label: 'Hue Rotation', min: 0, max: 360, value: 0, unit: '°' }]
  },
  { id: 'grayscale', name: 'Grayscale Converter', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '⬛',
    desc: 'Convert any color image to grayscale instantly. Our tool uses professional luminance-weighted conversion for the most natural-looking results.',
    features: ['Professional luminance-weighted conversion', 'Instant processing', 'Maintains original resolution', 'Supports PNG, JPG, WEBP', 'Free and private'],
    faq: [
      ['How does this differ from desaturation?', 'Grayscale conversion uses weighted values based on human perception (luminance), producing more natural results than simply removing saturation.'],
      ['Can I adjust the grayscale mix?', 'Our basic converter applies standard luminance weighting. For custom mixes, try our Black & White Converter tool.'],
      ['Is the output always PNG?', 'The output format matches your preference — you can download as PNG or JPG.']
    ],
    jsFile: 'grayscale.js',
    controls: []
  },
  { id: 'sepia', name: 'Sepia Filter', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🟤',
    desc: 'Add a warm, nostalgic sepia tone to your photos. Our sepia filter creates a classic vintage look reminiscent of old photographs.',
    features: ['Authentic sepia tone algorithm', 'Adjustable intensity', 'Real-time preview', 'Preserves image dimensions', 'Download in original quality'],
    faq: [
      ['What is a sepia filter?', 'A sepia filter adds a warm brownish tone to photos, mimicking the look of early photography from the 19th century.'],
      ['Can I control the sepia intensity?', 'Yes, our adjustable slider lets you blend between the original and fully sepia-toned image.'],
      ['Does this work on portraits?', 'Absolutely! Sepia filters are particularly popular for portrait photography.']
    ],
    jsFile: 'sepia.js',
    controls: [{ type: 'range', id: 'sepiaIntensity', label: 'Sepia Intensity', min: 0, max: 100, value: 100, unit: '%' }]
  },
  { id: 'invert', name: 'Invert Colors', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🔀',
    desc: 'Invert all colors in your image to create a photo negative effect. Perfect for creative effects and artistic photography.',
    features: ['Instant color inversion', 'True negative effect', 'One-click processing', 'All formats supported', 'No quality loss'],
    faq: [
      ['What happens when I invert colors?', 'Each pixel\'s color is replaced with its complementary value. White becomes black, blue becomes orange, etc.'],
      ['Can I partially invert?', 'Our tool offers an intensity slider to blend between original and inverted colors.'],
      ['Is this useful beyond creative effects?', 'Yes! Inverted images can help reveal hidden details in overexposed or underexposed photos.']
    ],
    jsFile: 'invert.js',
    controls: [{ type: 'range', id: 'invertIntensity', label: 'Invert Intensity', min: 0, max: 100, value: 100, unit: '%' }]
  },
  { id: 'blur', name: 'Blur Tool', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🌫️', popular: true,
    desc: 'Apply adjustable blur effects to your images. From subtle softening to heavy Gaussian blur, control the exact amount with a simple slider.',
    features: ['Adjustable blur radius', 'Smooth Gaussian blur algorithm', 'Real-time preview', 'GPU-accelerated rendering', 'Supports all image formats'],
    faq: [
      ['What type of blur is used?', 'We use a Gaussian blur algorithm that produces smooth, natural-looking results at any blur radius.'],
      ['Can I blur specific areas?', 'Our basic blur tool applies the effect to the entire image. For selective blurring, combine with our cropping tool.'],
      ['How much blur can I apply?', 'The slider ranges from 0 (no blur) to 20 pixels radius. This covers everything from subtle softening to heavy blur effects.']
    ],
    jsFile: 'blur.js',
    controls: [{ type: 'range', id: 'blurRadius', label: 'Blur Radius', min: 0, max: 20, value: 0, unit: 'px', step: 0.5 }]
  },
  { id: 'sharpen', name: 'Sharpen Tool', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🔍',
    desc: 'Enhance the sharpness and detail of your photos with our free online sharpening tool. Perfect for making blurry photos clearer.',
    features: ['Adjustable sharpening strength', 'Unsharp mask algorithm', 'Preserves image details', 'Instant preview', 'Works on mobile'],
    faq: [
      ['Can this fix a completely blurry photo?', 'Sharpening can enhance edge contrast and make images appear clearer, but it cannot reconstruct detail that was never captured.'],
      ['Will over-sharpening look bad?', 'Excessive sharpening can create halos around edges. We recommend gradual adjustments for natural results.'],
      ['What image types benefit most?', 'Photos with slight softness from camera shake or focus issues benefit most from sharpening.']
    ],
    jsFile: 'sharpen.js',
    controls: [{ type: 'range', id: 'sharpenAmount', label: 'Sharpen Amount', min: 0, max: 10, value: 0, unit: '', step: 0.5 }]
  },
  { id: 'pixelate', name: 'Image Pixelator', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🟩',
    desc: 'Create a retro pixel art effect by pixelating your images. Control the pixel size to get the perfect level of detail.',
    features: ['Adjustable pixel size', 'Creates authentic pixel art look', 'Real-time preview', 'Download as PNG', 'Fun for social media'],
    faq: [
      ['How does pixelation work?', 'The tool divides your image into blocks and fills each block with the average color, creating a mosaic-like effect.'],
      ['What pixel sizes work best?', 'Small values (2-5) create subtle effects, while larger values (10-30) create dramatic pixel art looks.'],
      ['Can I use this for game graphics?', 'Absolutely! Pixelation is great for creating retro-style game textures and sprites.']
    ],
    jsFile: 'pixelate.js',
    controls: [{ type: 'range', id: 'pixelSize', label: 'Pixel Size', min: 1, max: 50, value: 10, unit: 'px' }]
  },
  { id: 'vignette', name: 'Vignette Effect', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🔲',
    desc: 'Add a beautiful vignette darkening effect around the edges of your photos. Perfect for drawing focus to the center of an image.',
    features: ['Adjustable vignette strength', 'Control inner and outer radius', 'Customizable darkness level', 'Real-time preview', 'Multiple blend modes'],
    faq: [
      ['What is a vignette effect?', 'A vignette is a gradual darkening toward the edges of an image, commonly used in photography to draw attention to the center.'],
      ['Can I create a white vignette?', 'Yes, our tool allows you to choose between dark and light vignette effects.'],
      ['Is this common in professional photography?', 'Absolutely! Vignetting is widely used in portrait, wedding, and fine art photography.']
    ],
    jsFile: 'vignette.js',
    controls: [
      { type: 'range', id: 'vignetteStrength', label: 'Strength', min: 0, max: 100, value: 50, unit: '%' },
      { type: 'range', id: 'vignetteRadius', label: 'Radius', min: 10, max: 100, value: 60, unit: '%' }
    ]
  },
  { id: 'opacity', name: 'Opacity/Transparency', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '👁️',
    desc: 'Adjust the opacity and transparency of any image. Make images semi-transparent for watermarks, overlays, and layered designs.',
    features: ['Full opacity control from 0-100%', 'Transparent background preview', 'Export as transparent PNG', 'Real-time adjustment', 'Perfect for overlays'],
    faq: [
      ['Will transparency be preserved?', 'Yes! When you export, transparency is preserved in PNG format. JPG does not support transparency.'],
      ['Can I make only part of an image transparent?', 'For partial transparency, use our Background Eraser tool which allows brush-based removal.'],
      ['What format should I download in?', 'Always choose PNG for images with transparency. JPG will replace transparent areas with white.']
    ],
    jsFile: 'opacity.js',
    controls: [{ type: 'range', id: 'opacity', label: 'Opacity', min: 0, max: 100, value: 100, unit: '%' }]
  },
  { id: 'duotone', name: 'Duotone Effect Generator', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🎭',
    desc: 'Create stunning duotone effects by mapping image shadows and highlights to custom color pairs. Popular in modern web design.',
    features: ['Custom shadow and highlight colors', 'Preset color combinations', 'Real-time preview', 'High-quality color mapping', 'Download as PNG'],
    faq: [
      ['What is a duotone effect?', 'Duotone maps an image to two colors — shadows become one color and highlights become another, creating a dramatic two-tone effect.'],
      ['Can I create my own color combinations?', 'Yes! Use the two color pickers to select any shadow and highlight colors you want.'],
      ['Where are duotone effects used?', 'Duotone effects are popular in Spotify-style marketing, album covers, modern web design, and editorial layouts.']
    ],
    jsFile: 'duotone.js',
    controls: [
      { type: 'color', id: 'shadowColor', label: 'Shadow Color', value: '#1a0533' },
      { type: 'color', id: 'highlightColor', label: 'Highlight Color', value: '#ff6b35' }
    ]
  },
  { id: 'color-balance', name: 'Color Balance Tool', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '⚖️',
    desc: 'Fine-tune the red, green, and blue color channels in your images. Perfect for correcting color casts and achieving accurate color reproduction.',
    features: ['Independent RGB channel control', 'Real-time color correction', 'Precise slider adjustments', 'Before/after comparison', 'Reset to original'],
    faq: [
      ['When should I use color balance?', 'Color balance is useful for correcting color casts caused by lighting conditions, such as yellowish indoor lighting or bluish shade.'],
      ['How do I know the colors are correct?', 'Use the before/after comparison view. For critical work, compare against known neutral tones (gray, white).'],
      ['Can I fix white balance issues?', 'Yes, adjusting the Red/Blue and Green/Magenta balance can effectively correct most white balance problems.']
    ],
    jsFile: 'color-balance.js',
    controls: [
      { type: 'range', id: 'redChannel', label: 'Red Channel', min: -100, max: 100, value: 0, unit: '' },
      { type: 'range', id: 'greenChannel', label: 'Green Channel', min: -100, max: 100, value: 0, unit: '' },
      { type: 'range', id: 'blueChannel', label: 'Blue Channel', min: -100, max: 100, value: 0, unit: '' }
    ]
  },
  { id: 'exposure', name: 'Exposure Adjuster', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '📸',
    desc: 'Simulate camera exposure adjustment on your photos. Brighten underexposed images or darken overexposed shots with precision control.',
    features: ['Simulates camera EV adjustment', 'Natural-looking brightness changes', 'Preserves highlight and shadow detail', 'Real-time preview', 'Works on all formats'],
    faq: [
      ['How is exposure different from brightness?', 'Exposure adjustment mimics how a camera sensor captures light, affecting the entire tonal range more naturally than simple brightness.'],
      ['Can I recover overexposed photos?', 'You can reduce exposure to darken highlights, but severely clipped highlights cannot be fully recovered.'],
      ['What range is available?', 'The slider simulates -3 to +3 EV stops of exposure adjustment.']
    ],
    jsFile: 'exposure.js',
    controls: [{ type: 'range', id: 'exposure', label: 'Exposure', min: -100, max: 100, value: 0, unit: '' }]
  },
  { id: 'warmth', name: 'Warmth/Temperature', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🌡️',
    desc: 'Adjust the color temperature of your photos. Make images warmer with golden tones or cooler with blue tints for different moods.',
    features: ['Warm and cool temperature control', 'Natural color shifting', 'Real-time preview', 'Great for mood adjustments', 'Preserves image detail'],
    faq: [
      ['What is color temperature?', 'Color temperature measures the warmth (orange/yellow) or coolness (blue) of light in an image, measured in Kelvin.'],
      ['Which direction should I adjust?', 'Move toward warm for a sunny, cozy feel. Move toward cool for a crisp, modern, or melancholic mood.'],
      ['Can this fix mixed lighting?', 'Temperature adjustment affects the entire image uniformly. For mixed lighting, our Color Balance tool offers more precise control.']
    ],
    jsFile: 'warmth.js',
    controls: [{ type: 'range', id: 'warmth', label: 'Temperature', min: -100, max: 100, value: 0, unit: '' }]
  },
  { id: 'vintage', name: 'Vintage Filter', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '📽️',
    desc: 'Apply a nostalgic vintage film look to your photos. Combines color grading, grain, and fade effects for an authentic retro aesthetic.',
    features: ['Multiple vintage presets', 'Adjustable intensity', 'Film grain simulation', 'Color fade effect', 'One-click application'],
    faq: [
      ['What makes a photo look vintage?', 'Vintage effects typically include faded blacks, warm color shifts, reduced contrast, and subtle grain — mimicking old film photography.'],
      ['Are there different vintage styles?', 'Yes, our presets include Classic Film, Warm Nostalgia, Faded Memory, and Cool Vintage — each with different characteristics.'],
      ['Can I customize the vintage effect?', 'Yes, adjust the intensity slider and toggle grain on/off to create your preferred vintage look.']
    ],
    jsFile: 'vintage.js',
    controls: [
      { type: 'select', id: 'vintagePreset', label: 'Preset', options: ['Classic Film', 'Warm Nostalgia', 'Faded Memory', 'Cool Vintage'] },
      { type: 'range', id: 'vintageIntensity', label: 'Intensity', min: 0, max: 100, value: 70, unit: '%' }
    ]
  },
  { id: 'bw', name: 'Black & White Converter', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '⬜',
    desc: 'Convert images to black and white with professional control. Adjust how individual color channels contribute to the final grayscale result.',
    features: ['Channel-aware conversion', 'Red, green, blue channel weight sliders', 'High-contrast and soft presets', 'Real-time preview', 'Professional results'],
    faq: [
      ['How is this different from Grayscale?', 'The grayscale tool applies standard conversion weights. This tool lets you control how much each color channel contributes, giving you artistic control.'],
      ['What channel settings work best for portraits?', 'Increasing the red channel weight typically produces more flattering skin tones in portrait black and white conversion.'],
      ['Can I create high-contrast B&W?', 'Yes! Increase individual channel weights and combine with our Contrast Adjuster for dramatic high-contrast black and white images.']
    ],
    jsFile: 'bw.js',
    controls: [
      { type: 'range', id: 'redWeight', label: 'Red Weight', min: 0, max: 100, value: 30, unit: '%' },
      { type: 'range', id: 'greenWeight', label: 'Green Weight', min: 0, max: 100, value: 59, unit: '%' },
      { type: 'range', id: 'blueWeight', label: 'Blue Weight', min: 0, max: 100, value: 11, unit: '%' }
    ]
  },
  { id: 'noise', name: 'Noise Reducer', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '📡',
    desc: 'Reduce image noise and grain for cleaner, smoother photos. Works especially well for low-light and high-ISO photographs.',
    features: ['Adjustable noise reduction', 'Preserves edge detail', 'Smooth and detail balance', 'Works on all formats', 'Real-time preview'],
    faq: [
      ['What is image noise?', 'Image noise appears as random grain or speckles, especially in low-light photos taken at high ISO settings.'],
      ['Does noise reduction blur the image?', 'Some softening is inevitable, but our algorithm prioritizes preserving edges while smoothing flat areas.'],
      ['Should I reduce noise before or after other edits?', 'It\'s generally best to reduce noise first, before sharpening or adjusting contrast, which can amplify noise.']
    ],
    jsFile: 'noise.js',
    controls: [{ type: 'range', id: 'noiseReduction', label: 'Noise Reduction', min: 0, max: 10, value: 0, unit: '', step: 0.5 }]
  },
  { id: 'posterize', name: 'Threshold/Posterize', cat: 'image-editing', catName: 'Image Editing & Adjustment', icon: '🎯',
    desc: 'Reduce the number of colors in an image to create posterized art effects. Or apply a threshold for dramatic black and white results.',
    features: ['Adjustable color levels (2-32)', 'Threshold mode for B&W', 'Real-time preview', 'Poster art aesthetic', 'Great for graphic design'],
    faq: [
      ['What is posterization?', 'Posterization reduces the number of color levels in an image, creating flat areas of color that look like a printed poster.'],
      ['What is the threshold effect?', 'Threshold converts every pixel to either pure black or pure white based on its brightness, creating a stark two-tone image.'],
      ['How many color levels should I use?', '2-4 levels create dramatic effects, 5-8 create a stylized poster look, and 9-16 create more subtle quantization.']
    ],
    jsFile: 'posterize.js',
    controls: [
      { type: 'range', id: 'posterLevels', label: 'Color Levels', min: 2, max: 32, value: 8, unit: '' },
      { type: 'toggle', id: 'thresholdMode', label: 'Threshold Mode (B&W)' }
    ]
  },

  // Category B: Cropping, Cutting & Resizing
  { id: 'cropper', name: 'Image Cropper', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '✂️', popular: true,
    desc: 'Freeform crop any image to your desired dimensions. Click and drag to select the crop area, then download the cropped result.',
    features: ['Freeform crop selection', 'Pixel-precise dimensions', 'Drag to resize handles', 'Aspect ratio lock option', 'Download cropped result'],
    faq: [
      ['Can I set exact crop dimensions?', 'Yes, you can enter exact pixel values for width and height, or drag the selection handles visually.'],
      ['Does cropping reduce image quality?', 'Cropping simply removes pixels outside the selection. The cropped area retains its original quality and resolution.'],
      ['Can I crop to a circle?', 'For circle cropping, use our dedicated Circle Crop Tool which applies a circular mask to your image.']
    ],
    jsFile: 'cropper.js',
    controls: [
      { type: 'number', id: 'cropX', label: 'X Position', value: 0, unit: 'px' },
      { type: 'number', id: 'cropY', label: 'Y Position', value: 0, unit: 'px' },
      { type: 'number', id: 'cropW', label: 'Width', value: 100, unit: 'px' },
      { type: 'number', id: 'cropH', label: 'Height', value: 100, unit: 'px' }
    ]
  },
  { id: 'square-crop', name: 'Square Crop Tool', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '⬜',
    desc: 'Crop any image to a perfect 1:1 square. Ideal for Instagram posts, profile pictures, and product photos.',
    features: ['Perfect 1:1 aspect ratio', 'Drag to position', 'Center or manual placement', 'High-quality output', 'Instant download'],
    faq: [
      ['Why would I need a square crop?', 'Square crops are required for Instagram feed posts, many profile picture formats, and e-commerce product listings.'],
      ['Where will the crop be centered?', 'By default, the crop centers on the image. You can drag to reposition the crop area.'],
      ['What resolution should I use?', 'The tool crops at the original image resolution. For Instagram, 1080×1080px is recommended.']
    ],
    jsFile: 'square-crop.js',
    controls: [
      { type: 'number', id: 'outputSize', label: 'Output Size', value: 512, unit: 'px' }
    ]
  },
  { id: 'circle-crop', name: 'Circle Crop Tool', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '⭕',
    desc: 'Crop images into a perfect circle with transparent background. Ideal for profile pictures, avatars, and social media.',
    features: ['Perfect circular crop', 'Transparent background output', 'Drag to position', 'PNG output with transparency', 'Works on any image'],
    faq: [
      ['Will the output have a transparent background?', 'Yes, the circle crop produces a PNG with transparent areas outside the circle.'],
      ['Can I adjust the circle size?', 'Yes, drag the handles to resize the circle, or use the slider for precise control.'],
      ['Is this good for profile pictures?', 'Perfect! Circular profile pictures are the standard on most social media platforms.']
    ],
    jsFile: 'circle-crop.js',
    controls: [
      { type: 'range', id: 'circleSize', label: 'Circle Size', min: 10, max: 100, value: 80, unit: '%' }
    ]
  },
  { id: 'aspect-ratio-crop', name: 'Aspect Ratio Crop', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '📐', popular: true,
    desc: 'Crop images to standard aspect ratios used across social media and print. Presets for 1:1, 4:5, 16:9, 9:16, 3:4, and more.',
    features: ['Social media presets', 'Custom aspect ratio input', 'Visual crop guide', 'One-click crop', 'Multiple format presets'],
    faq: [
      ['What aspect ratios are available?', 'Common presets include 1:1 (square), 4:5 (Instagram portrait), 16:9 (widescreen), 9:16 (stories), 3:2 (photo print), and custom ratios.'],
      ['Which ratio is best for Instagram?', 'Use 1:1 for feed posts, 4:5 for portrait posts (takes more screen space), and 9:16 for Stories and Reels.'],
      ['Can I enter a custom ratio?', 'Yes, enter any width:height ratio in the custom fields.']
    ],
    jsFile: 'aspect-ratio-crop.js',
    controls: [
      { type: 'select', id: 'aspectRatio', label: 'Aspect Ratio', options: ['1:1 (Square)', '4:5 (Instagram)', '16:9 (Widescreen)', '9:16 (Story)', '3:2 (Photo)', '4:3 (Standard)', '21:9 (Cinematic)', 'Custom'] }
    ]
  },
  { id: 'resizer-px', name: 'Image Resizer (Pixels)', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '📏', popular: true,
    desc: 'Resize images to exact pixel dimensions. Enter width and height values, lock the aspect ratio, and download the resized image.',
    features: ['Exact pixel dimensions', 'Lock/unlock aspect ratio', 'Batch resize support', 'High-quality resampling', 'Shows file size comparison'],
    faq: [
      ['Will resizing reduce quality?', 'Reducing size maintains quality. Enlarging may introduce some softness because new pixels are interpolated.'],
      ['What does "lock aspect ratio" mean?', 'When locked, changing width automatically adjusts height (and vice versa) to prevent stretching or distortion.'],
      ['How small should I resize for web?', 'For web use, 1200-2000px on the long side is usually sufficient. For thumbnails, 300-500px works well.']
    ],
    jsFile: 'resizer-px.js',
    controls: [
      { type: 'number', id: 'newWidth', label: 'Width', value: 800, unit: 'px' },
      { type: 'number', id: 'newHeight', label: 'Height', value: 600, unit: 'px' },
      { type: 'toggle', id: 'lockAspect', label: 'Lock Aspect Ratio' }
    ]
  },
  { id: 'resizer-pct', name: 'Image Resizer (%)', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '📊',
    desc: 'Scale images up or down by percentage. Simple and quick way to resize images while maintaining the original proportions.',
    features: ['Percentage-based scaling', 'Maintains proportions', 'Preview dimensions', 'Supports upscaling', 'Shows resulting file size'],
    faq: [
      ['When would I use percentage resize?', 'Percentage resize is ideal when you want to maintain proportions but don\'t need specific pixel dimensions — e.g., reduce all images by 50%.'],
      ['Can I enlarge images this way?', 'Yes, set the percentage above 100% to upscale. Note that upscaling adds interpolated pixels.'],
      ['What percentage is good for web?', '50-75% works well for most web applications, reducing file size while maintaining acceptable quality.']
    ],
    jsFile: 'resizer-pct.js',
    controls: [
      { type: 'range', id: 'scalePercent', label: 'Scale', min: 10, max: 300, value: 100, unit: '%' }
    ]
  },
  { id: 'bulk-resize', name: 'Bulk Image Resizer', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '📦',
    desc: 'Resize multiple images at once to the same dimensions. Upload up to 20 images and resize them all in one go.',
    features: ['Resize multiple images at once', 'Same dimensions for all', 'Batch download as ZIP', 'Maintains aspect ratio option', 'Shows before/after sizes'],
    faq: [
      ['How many images can I resize at once?', 'You can upload up to 20 images in a single batch for processing.'],
      ['Will all images be the same size?', 'Yes, all images will be resized to the specified dimensions. Enable "maintain aspect ratio" for proportional results.'],
      ['How do I download all results?', 'Click the "Download All" button to download a ZIP file containing all resized images.']
    ],
    jsFile: 'bulk-resize.js',
    controls: [
      { type: 'number', id: 'bulkWidth', label: 'Width', value: 800, unit: 'px' },
      { type: 'number', id: 'bulkHeight', label: 'Height', value: 600, unit: 'px' },
      { type: 'toggle', id: 'bulkLockAspect', label: 'Lock Aspect Ratio' }
    ]
  },
  { id: 'bg-eraser', name: 'Background Eraser', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '🧹', popular: true,
    desc: 'Erase image backgrounds manually using a brush tool. Paint over areas you want to remove and download the result with transparency.',
    features: ['Adjustable brush size', 'Erase or restore mode', 'Zoom and pan support', 'Transparent PNG output', 'Undo/redo support'],
    faq: [
      ['How do I erase the background?', 'Select the eraser brush, adjust the size, and paint over the background areas. They will become transparent.'],
      ['Can I undo mistakes?', 'Yes! Use the Undo button or Ctrl+Z to step back through your changes.'],
      ['Is this automatic background removal?', 'This is a manual tool giving you full control. For automatic removal, the results would require a paid API. This manual approach gives precise results.']
    ],
    jsFile: 'bg-eraser.js',
    controls: [
      { type: 'range', id: 'brushSize', label: 'Brush Size', min: 1, max: 100, value: 20, unit: 'px' },
      { type: 'select', id: 'eraseMode', label: 'Mode', options: ['Erase', 'Restore'] }
    ]
  },
  { id: 'grid-cutter', name: 'Image Cutter (Grid)', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '🔲',
    desc: 'Slice your image into a grid of equal tiles. Perfect for creating image puzzles or splitting large images for social media.',
    features: ['Custom grid dimensions', 'Preview tile layout', 'Number each tile', 'Download all tiles', 'ZIP download option'],
    faq: [
      ['What can I use grid cutting for?', 'Grid cutting is popular for Instagram grid posts, image puzzles, printing large images across multiple pages, and tile-based designs.'],
      ['How do I set the grid size?', 'Enter the number of rows and columns. The tool will calculate equal tile sizes based on your image dimensions.'],
      ['Are tile dimensions equal?', 'Yes, all tiles are equal except possibly the rightmost column and bottom row, which may be slightly smaller if the image doesn\'t divide evenly.']
    ],
    jsFile: 'grid-cutter.js',
    controls: [
      { type: 'number', id: 'gridCols', label: 'Columns', value: 3, unit: '' },
      { type: 'number', id: 'gridRows', label: 'Rows', value: 3, unit: '' }
    ]
  },
  { id: 'passport-photo', name: 'Passport Photo Maker', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '🪪',
    desc: 'Create passport-size photos with proper dimensions. Choose from standard passport photo sizes for different countries.',
    features: ['Multiple country standards', 'Proper face centering', 'White/blue background options', 'Print-ready layout', 'Standard dimensions'],
    faq: [
      ['What passport sizes are available?', 'We support US (2×2"), UK (35×45mm), Canada (50×70mm), India (35×45mm), and many more country standards.'],
      ['Can I change the background color?', 'Yes, choose between white, light blue, and light gray backgrounds for your passport photo.'],
      ['Is this accepted for official use?', 'Our tool provides the correct dimensions, but official acceptance depends on other factors like photo quality and recency. Always check with your local authority.']
    ],
    jsFile: 'passport-photo.js',
    controls: [
      { type: 'select', id: 'country', label: 'Country Standard', options: ['US (2×2")', 'UK (35×45mm)', 'India (35×45mm)', 'Canada (50×70mm)', 'Australia (35×45mm)', 'EU (35×45mm)'] },
      { type: 'color', id: 'bgColor', label: 'Background Color', value: '#ffffff' }
    ]
  },
  { id: 'social-resizer', name: 'Social Media Resizer', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '📱', popular: true,
    desc: 'Resize images for every social media platform. Presets for Instagram, Facebook, Twitter, LinkedIn, Pinterest, and YouTube with exact dimensions.',
    features: ['Platform-specific presets', 'Exact pixel dimensions', 'One-click resize', 'Preview with guidelines', 'Multiple format export'],
    faq: [
      ['Which platforms are supported?', 'Instagram (post, story, reel), Facebook (post, cover, story), Twitter (post, header), LinkedIn (post, cover), Pinterest, and YouTube (thumbnail, banner).'],
      ['Will my image be cropped to fit?', 'The tool shows how the image will be cropped and lets you adjust the position before finalizing.'],
      ['What format should I use?', 'PNG for graphics with text, JPG for photos. We recommend the format that best suits your content type.']
    ],
    jsFile: 'social-resizer.js',
    controls: [
      { type: 'select', id: 'platform', label: 'Platform', options: ['Instagram Post (1080×1080)', 'Instagram Story (1080×1920)', 'Instagram Reel (1080×1920)', 'Facebook Post (1200×630)', 'Facebook Cover (820×312)', 'Twitter Post (1200×675)', 'LinkedIn Post (1200×627)', 'Pinterest Pin (1000×1500)', 'YouTube Thumbnail (1280×720)'] }
    ]
  },
  { id: 'banner-resizer', name: 'Banner/Cover Photo Resizer', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '🖼️',
    desc: 'Resize banners and cover photos for websites, YouTube, Facebook, Twitter, and LinkedIn with proper dimensions and safe zones.',
    features: ['Platform cover dimensions', 'Safe zone guidelines', 'Drag to reposition', 'High-quality output', 'Preview at actual size'],
    faq: [
      ['What banner sizes are available?', 'YouTube channel art, Facebook cover, Twitter header, LinkedIn banner, and generic web banners in common sizes.'],
      ['What are safe zones?', 'Safe zones show the area visible on all devices. Content outside may be cropped on mobile or smaller screens.'],
      ['Can I add text to my banner?', 'For text overlay on banners, use our Text on Image tool first, then resize with this tool.']
    ],
    jsFile: 'banner-resizer.js',
    controls: [
      { type: 'select', id: 'bannerType', label: 'Banner Type', options: ['YouTube Channel Art (2560×1440)', 'YouTube Thumbnail (1280×720)', 'Facebook Cover (820×312)', 'Twitter Header (1500×500)', 'LinkedIn Cover (1584×396)', 'Twitch Banner (1200×480)'] }
    ]
  },
  { id: 'auto-trim', name: 'Image Trimmer', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '🎗️',
    desc: 'Automatically crop whitespace and empty borders from images. Great for removing unnecessary transparent or white margins.',
    features: ['Auto-detect content bounds', 'Adjustable threshold', 'Trim whitespace or transparency', 'Preview trim area', 'One-click trim'],
    faq: [
      ['What counts as whitespace?', 'The tool detects pixels that are white, near-white, or transparent (for PNGs) and trims borders of these pixels.'],
      ['Can I set what to trim?', 'Yes, choose between trimming white, near-white, transparent, or a specific background color.'],
      ['Is there a tolerance setting?', 'Yes, adjust the threshold to control how closely the trim follows your content edges.']
    ],
    jsFile: 'auto-trim.js',
    controls: [
      { type: 'range', id: 'trimThreshold', label: 'Threshold', min: 0, max: 50, value: 10, unit: '%' },
      { type: 'select', id: 'trimMode', label: 'Trim Mode', options: ['White Background', 'Transparent', 'Custom Color'] }
    ]
  },
  { id: 'collage-maker', name: 'Collage Maker', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '🧩',
    desc: 'Combine multiple photos into a beautiful collage. Choose from various layouts and arrangements for your photo collage.',
    features: ['Multiple layout options', 'Drag to arrange photos', 'Adjustable spacing/gaps', 'Custom background color', 'High-res download'],
    faq: [
      ['How many photos can I add?', 'You can add up to 9 photos in a single collage, depending on the layout you choose.'],
      ['Can I rearrange photos after placing them?', 'Yes! Drag and drop photos between slots to rearrange them.'],
      ['What size is the output?', 'The output size is based on the layout dimensions. Standard output is 1200×1200px for social media sharing.']
    ],
    jsFile: 'collage-maker.js',
    controls: [
      { type: 'select', id: 'collageLayout', label: 'Layout', options: ['2 Photos (Side by Side)', '2 Photos (Stacked)', '3 Photos (1 Large + 2 Small)', '4 Photos (Grid)', '4 Photos (1 Large + 3 Small)', '6 Photos (Grid 2×3)', '9 Photos (Grid 3×3)'] },
      { type: 'range', id: 'collageGap', label: 'Gap Size', min: 0, max: 20, value: 8, unit: 'px' },
      { type: 'color', id: 'collageBg', label: 'Background', value: '#ffffff' }
    ]
  },
  { id: 'image-splitter', name: 'Image Splitter', cat: 'cropping-resizing', catName: 'Cropping, Cutting & Resizing', icon: '🔀',
    desc: 'Split an image into N equal tiles or custom-sized sections. Perfect for Instagram grid posts and tile-based designs.',
    features: ['Split into N tiles', 'Custom rows and columns', 'Preview with grid overlay', 'Download individually or as ZIP', 'Numbered output files'],
    faq: [
      ['How is this different from Grid Cutter?', 'Image Splitter focuses on splitting for social media grid posts and provides more flexibility in how tiles are arranged and downloaded.'],
      ['What file naming is used?', 'Tiles are automatically named with sequential numbers (tile_1, tile_2, etc.) for easy organization.'],
      ['Can I split into uneven sections?', 'Yes, you can specify custom row heights and column widths for non-uniform splits.']
    ],
    jsFile: 'image-splitter.js',
    controls: [
      { type: 'number', id: 'splitCols', label: 'Columns', value: 3, unit: '' },
      { type: 'number', id: 'splitRows', label: 'Rows', value: 3, unit: '' }
    ]
  },

  // Category C: Rotation, Flip & Transform
  { id: 'rotator', name: 'Image Rotator', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '🔃', popular: true,
    desc: 'Rotate images by 90°, 180°, or 270° with a single click. Quick and easy rotation for correcting orientation or creative purposes.',
    features: ['90° clockwise/counter-clockwise', '180° rotation', 'Auto-resize canvas', 'Instant processing', 'Preserves quality'],
    faq: [
      ['Will rotation change the image dimensions?', '90° and 270° rotations swap width and height. 180° rotation preserves dimensions.'],
      ['Can I fix photos taken in wrong orientation?', 'Yes! Use 90° rotations to correct photos taken with the camera held sideways.'],
      ['Does rotation affect image quality?', 'No, 90° rotations are lossless — pixels are simply rearranged without any interpolation.']
    ],
    jsFile: 'rotator.js',
    controls: [
      { type: 'select', id: 'rotationAngle', label: 'Rotation', options: ['90° Clockwise', '90° Counter-Clockwise', '180°', '270° Clockwise'] }
    ]
  },
  { id: 'free-rotate', name: 'Free-Angle Rotator', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '🎠',
    desc: 'Rotate images by any custom angle. Precise degree control with automatic canvas expansion to prevent cropping.',
    features: ['Any angle from 0-360°', 'Precise degree input', 'Auto canvas expansion', 'Background color choice', 'Real-time preview'],
    faq: [
      ['What happens at angles other than 90°?', 'Non-90° angles require canvas expansion to fit the rotated image. The new canvas area is filled with your chosen background color.'],
      ['Can I enter an exact angle?', 'Yes, type any angle in the input field or use the slider for visual adjustment.'],
      ['What background color fills the gaps?', 'White is the default. You can change it to any color using the color picker.']
    ],
    jsFile: 'free-rotate.js',
    controls: [
      { type: 'range', id: 'freeRotation', label: 'Angle', min: -180, max: 180, value: 0, unit: '°' },
      { type: 'color', id: 'rotationBg', label: 'Background', value: '#ffffff' }
    ]
  },
  { id: 'h-flip', name: 'Horizontal Flip', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '↔️',
    desc: 'Mirror your image horizontally (left to right). Useful for correcting mirrored webcam shots or creating symmetrical compositions.',
    features: ['Instant horizontal flip', 'Preserves dimensions', 'No quality loss', 'One-click operation', 'Supports all formats'],
    faq: [
      ['When should I flip horizontally?', 'Common uses: correcting mirrored selfies/webcam images, creating reflections, and text that appears backwards.'],
      ['Does flipping change the file size?', 'No, flipping rearranges pixels without changing any data, so the file size remains identical.'],
      ['Can I combine flip with other transforms?', 'Yes, flip first, then use rotation or other tools for combined effects.']
    ],
    jsFile: 'h-flip.js',
    controls: []
  },
  { id: 'v-flip', name: 'Vertical Flip', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '↕️',
    desc: 'Flip your image vertically (top to bottom). Create reflections, upside-down effects, or correct vertically mirrored images.',
    features: ['Instant vertical flip', 'Preserves all image data', 'No quality loss', 'Works on any image size', 'Download immediately'],
    faq: [
      ['What is vertical flip used for?', 'Creating water reflections, correcting upside-down images, and artistic effects.'],
      ['Is this the same as rotating 180°?', 'No. Vertical flip mirrors top-to-bottom while preserving left-right orientation. 180° rotation flips both axes.'],
      ['Can I create a reflection effect?', 'Yes! Flip an image vertically, then use our Canvas Padding tool to extend the canvas downward for a classic reflection look.']
    ],
    jsFile: 'v-flip.js',
    controls: []
  },
  { id: 'perspective', name: 'Perspective/Skew Tool', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '🔳',
    desc: 'Apply perspective and skew transformations to images. Create 3D-like effects or correct perspective distortion.',
    features: ['Horizontal and vertical skew', 'Adjustable perspective angles', 'Real-time preview', 'Canvas auto-expansion', 'Fill color options'],
    faq: [
      ['What is perspective transformation?', 'Perspective transformation simulates viewing an image from an angle, creating a 3D depth effect on a 2D image.'],
      ['Can I correct perspective distortion?', 'Yes! If a building looks like it\'s leaning, slight perspective correction can straighten it.'],
      ['What values should I start with?', 'Start with small values (5-15°) and increase gradually. Large perspective values create dramatic distortion.']
    ],
    jsFile: 'perspective.js',
    controls: [
      { type: 'range', id: 'skewX', label: 'Horizontal Skew', min: -45, max: 45, value: 0, unit: '°' },
      { type: 'range', id: 'skewY', label: 'Vertical Skew', min: -45, max: 45, value: 0, unit: '°' }
    ]
  },
  { id: 'straighten', name: 'Image Straightener', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '📏',
    desc: 'Straighten crooked photos and horizons with precise angle control. Perfect for fixing tilted landscape and architecture photos.',
    features: ['Fine angle control (0.1° steps)', 'Visual horizon guide', 'Auto-crop option', 'Background fill option', 'Before/after preview'],
    faq: [
      ['How do I know the right angle?', 'Use the visual guide line to align with your horizon or a reference line in the photo. Small adjustments make a big difference.'],
      ['Will straightening crop my image?', 'If "auto-crop" is enabled, yes — it removes the empty corners. Otherwise, the background color fills the gaps.'],
      ['Can I straighten and crop simultaneously?', 'Yes, enable auto-crop to automatically remove empty areas after straightening.']
    ],
    jsFile: 'straighten.js',
    controls: [
      { type: 'range', id: 'straightenAngle', label: 'Angle', min: -45, max: 45, value: 0, unit: '°', step: 0.1 },
      { type: 'toggle', id: 'autoCrop', label: 'Auto-Crop Empty Areas' }
    ]
  },
  { id: 'canvas-padding', name: 'Canvas Resizer/Padding', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '🔲',
    desc: 'Add or remove padding around images. Expand the canvas with a custom background color for framing or composition needs.',
    features: ['Add padding on all sides', 'Individual side control', 'Custom padding color', 'Pixel-precise amounts', 'Preview with grid'],
    faq: [
      ['When would I need canvas padding?', 'Common uses: adding white borders for printing, creating Instagram-safe margins, framing images, and preparing images for layout designs.'],
      ['Can I add different padding to each side?', 'Yes, control top, right, bottom, and left padding independently.'],
      ['What color is the padding?', 'Choose any color using the color picker. White and transparent are the most common choices.']
    ],
    jsFile: 'canvas-padding.js',
    controls: [
      { type: 'number', id: 'padTop', label: 'Top', value: 20, unit: 'px' },
      { type: 'number', id: 'padRight', label: 'Right', value: 20, unit: 'px' },
      { type: 'number', id: 'padBottom', label: 'Bottom', value: 20, unit: 'px' },
      { type: 'number', id: 'padLeft', label: 'Left', value: 20, unit: 'px' },
      { type: 'color', id: 'padColor', label: 'Padding Color', value: '#ffffff' }
    ]
  },
  { id: 'auto-orient', name: 'Auto-Orient (EXIF Fix)', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '🧭',
    desc: 'Automatically fix image orientation based on EXIF data. Corrects images that appear rotated when uploaded from phones.',
    features: ['Reads EXIF orientation', 'Auto-corrects rotation', 'Preserves EXIF data', 'One-click fix', 'Supports all formats'],
    faq: [
      ['Why are my photos rotated wrong?', 'Many phones record the orientation in EXIF data rather than actually rotating pixels. Some software ignores this data.'],
      ['Does this remove EXIF data?', 'You can choose to preserve or strip EXIF data during the fix process.'],
      ['Will this work on all images?', 'It works on images with EXIF orientation data. Images without EXIF data will be returned unchanged.']
    ],
    jsFile: 'auto-orient.js',
    controls: [
      { type: 'toggle', id: 'stripExif', label: 'Strip EXIF Data After Fix' }
    ]
  },
  { id: 'mirror', name: 'Mirror Effect', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '🪞',
    desc: 'Create beautiful mirror reflections of your images. Choose horizontal or vertical mirroring for artistic symmetry effects.',
    features: ['Horizontal and vertical mirror', 'Adjustable reflection opacity', 'Gap between original and mirror', 'Gradient fade option', 'Custom background'],
    faq: [
      ['What mirror effects are available?', 'Horizontal mirror creates left-right symmetry, vertical creates top-bottom symmetry. Both produce striking visual effects.'],
      ['Can I adjust the reflection?', 'Yes, control the reflection opacity, the gap between original and reflection, and add a gradient fade.'],
      ['What images work best for mirroring?', 'Landscapes, architecture, and symmetrical subjects produce the most striking mirror effects.']
    ],
    jsFile: 'mirror.js',
    controls: [
      { type: 'select', id: 'mirrorType', label: 'Mirror Direction', options: ['Horizontal', 'Vertical'] },
      { type: 'range', id: 'mirrorOpacity', label: 'Reflection Opacity', min: 10, max: 100, value: 50, unit: '%' },
      { type: 'range', id: 'mirrorGap', label: 'Gap', min: 0, max: 50, value: 4, unit: 'px' }
    ]
  },
  { id: 'tilt-3d', name: '3D Tilt Preview', cat: 'rotation-transform', catName: 'Rotation, Flip & Transform', icon: '🎲',
    desc: 'Preview your images with a 3D tilt and perspective effect. Great for mockups and presenting images in a 3D context.',
    features: ['Interactive 3D tilt', 'Mouse-following perspective', 'Adjustable tilt angle', 'Shadow and depth effect', 'Download rendered result'],
    faq: [
      ['What is 3D tilt preview?', 'It applies CSS perspective transforms to give your image a 3D appearance, as if it\'s floating and tilted in space.'],
      ['Can I download the 3D version?', 'Yes, the tool renders the 3D effect to a canvas that you can download as a PNG.'],
      ['Is this good for presentations?', 'Absolutely! 3D tilt previews are popular for product mockups, portfolio presentations, and social media posts.']
    ],
    jsFile: 'tilt-3d.js',
    controls: [
      { type: 'range', id: 'tiltX', label: 'Tilt X', min: -30, max: 30, value: 10, unit: '°' },
      { type: 'range', id: 'tiltY', label: 'Tilt Y', min: -30, max: 30, value: -10, unit: '°' },
      { type: 'range', id: 'tiltPerspective', label: 'Perspective', min: 100, max: 2000, value: 800, unit: 'px' }
    ]
  }
];

// Add more tools: Categories D-H...
const MORE_TOOLS = [
  // Category D: Text Tools
  { id: 'text-on-image', name: 'Text on Image', cat: 'text-tools', catName: 'Text & Typography', icon: '📝', popular: true,
    desc: 'Add text, captions, titles, and watermarks to your images. Choose font, size, color, position, and style for perfect text overlay.',
    features: ['Custom font, size, and color', 'Drag text positioning', 'Shadow and outline effects', 'Multiple text layers', 'Download with text baked in'],
    faq: [
      ['Can I use custom fonts?', 'Yes! Choose from our built-in font collection or upload your own fonts.'],
      ['Can I add multiple text elements?', 'Yes, add as many text layers as you need, each with independent styling and position.'],
      ['Is the text editable after adding?', 'Text is editable while in the tool. Once downloaded, text is merged with the image.']
    ],
    jsFile: 'text-on-image.js',
    controls: [
      { type: 'select', id: 'fontFamily', label: 'Font', options: ['Arial', 'Georgia', 'Courier New', 'Impact', 'Comic Sans MS', 'Times New Roman', 'Verdana'] },
      { type: 'range', id: 'fontSize', label: 'Font Size', min: 8, max: 200, value: 36, unit: 'px' },
      { type: 'color', id: 'textColor', label: 'Text Color', value: '#ffffff' },
      { type: 'select', id: 'textAlign', label: 'Alignment', options: ['Center', 'Left', 'Right'] }
    ]
  },
  { id: 'meme-generator', name: 'Meme Generator', cat: 'text-tools', catName: 'Text & Typography', icon: '😂', popular: true,
    desc: 'Create viral memes with custom text on any image. Uses Impact font styling with top and bottom text for classic meme format.',
    features: ['Classic meme text format', 'Top and bottom text', 'Impact font styling', 'Text stroke and shadow', 'Instant download'],
    faq: [
      ['How do I create a meme?', 'Upload an image, type your top text and bottom text, then download your meme!'],
      ['Can I use different fonts?', 'Yes, while Impact is the classic meme font, you can switch to any available font.'],
      ['Can I add more than two text lines?', 'Yes, you can add additional text elements beyond the standard top/bottom format.']
    ],
    jsFile: 'meme-generator.js',
    controls: [
      { type: 'text', id: 'topText', label: 'Top Text', placeholder: 'Top text...' },
      { type: 'text', id: 'bottomText', label: 'Bottom Text', placeholder: 'Bottom text...' },
      { type: 'range', id: 'memeFontSize', label: 'Text Size', min: 16, max: 120, value: 48, unit: 'px' }
    ]
  },
  { id: 'word-counter', name: 'Word Counter', cat: 'text-tools', catName: 'Text & Typography', icon: '🔢',
    desc: 'Count words, characters, sentences, paragraphs, and lines in any text. Essential tool for writers, students, and content creators.',
    features: ['Word count', 'Character count (with/without spaces)', 'Sentence and paragraph count', 'Reading time estimate', 'Real-time counting'],
    faq: [
      ['Is the counting real-time?', 'Yes! Statistics update instantly as you type or paste text.'],
      ['Does it count differently for different languages?', 'Basic word counting works across languages. For languages without spaces between words, results may vary.'],
      ['What is the reading time based on?', 'Reading time is calculated at an average of 200 words per minute for adults.']
    ],
    jsFile: 'word-counter.js',
    controls: []
  },
  { id: 'char-counter', name: 'Character Counter', cat: 'text-tools', catName: 'Text & Typography', icon: '#️⃣',
    desc: 'Count characters with and without spaces, track character limits for social media posts, and monitor text length in real time.',
    features: ['Characters with/without spaces', 'Social media limit tracking', 'Real-time counting', 'Copy-friendly display', 'Shows limits for popular platforms'],
    faq: [
      ['What social media limits are shown?', 'Twitter (280), Instagram (2200), Facebook (63206), LinkedIn (3000), and TikTok (4000) character limits.'],
      ['How do special characters count?', 'Each special character counts as one character. Emojis may count as 2 characters due to Unicode encoding.'],
      ['Can I check character limits without typing?', 'Paste your existing text to instantly see the character count against platform limits.']
    ],
    jsFile: 'char-counter.js',
    controls: []
  },
  { id: 'case-converter', name: 'Case Converter', cat: 'text-tools', catName: 'Text & Typography', icon: '🔡',
    desc: 'Convert text between UPPER CASE, lower case, Title Case, Sentence case, and more. One-click text case transformation.',
    features: ['UPPERCASE conversion', 'lowercase conversion', 'Title Case conversion', 'Sentence case conversion', 'Alternating Case (sArCaStIc)'],
    faq: [
      ['What is Title Case?', 'Title Case capitalizes the first letter of each major word. Common for headings and titles.'],
      ['What is Sentence case?', 'Sentence case capitalizes only the first letter of each sentence, like normal writing.'],
      ['Can I convert selected text?', 'Paste your text, choose the case, and the converted result appears instantly. Copy it back to use.']
    ],
    jsFile: 'case-converter.js',
    controls: []
  },
  { id: 'text-reverser', name: 'Text Reverser', cat: 'text-tools', catName: 'Text & Typography', icon: '🔃',
    desc: 'Reverse any text string character by character. Supports reversing entire text, individual words, or sentence order.',
    features: ['Reverse all characters', 'Reverse word order', 'Reverse each word individually', 'One-click copy', 'Instant processing'],
    faq: [
      ['What reversal options are available?', 'Reverse characters (olleh), reverse word order (world hello), or reverse within each word (olleh dlrow).'],
    ],
    jsFile: 'text-reverser.js',
    controls: []
  },
  { id: 'duplicate-remover', name: 'Duplicate Line Remover', cat: 'text-tools', catName: 'Text & Typography', icon: '🧹',
    desc: 'Remove duplicate lines from text while preserving the order of unique lines. Clean up lists, data, and text files instantly.',
    features: ['Remove exact duplicates', 'Case-sensitive option', 'Preserve line order', 'Show duplicate count', 'One-click copy result'],
    faq: [
      ['Does it remove empty lines too?', 'Optionally yes — toggle "Remove empty lines" to also filter out blank lines.'],
      ['Is matching case-sensitive?', 'By default no. Toggle case-sensitive matching for exact duplicate detection.'],
    ],
    jsFile: 'duplicate-remover.js',
    controls: [
      { type: 'toggle', id: 'caseSensitive', label: 'Case Sensitive Matching' },
      { type: 'toggle', id: 'removeEmpty', label: 'Remove Empty Lines' }
    ]
  },
  { id: 'slug-converter', name: 'Text to Slug', cat: 'text-tools', catName: 'Text & Typography', icon: '🔗',
    desc: 'Convert any text to a URL-friendly slug format. Removes special characters, replaces spaces with hyphens, and lowercases.',
    features: ['Instant slug generation', 'Custom separator option', 'Remove special characters', 'Lowercase conversion', 'Copy-to-clipboard'],
    faq: [
      ['What is a URL slug?', 'A slug is the part of a URL that identifies a page using readable words, like "my-blog-post" in example.com/my-blog-post.'],
      ['Can I use underscores instead of hyphens?', 'Yes, choose your preferred separator: hyphen (-), underscore (_), or custom.'],
    ],
    jsFile: 'slug-converter.js',
    controls: [
      { type: 'select', id: 'separator', label: 'Separator', options: ['Hyphen (-)', 'Underscore (_)', 'Dot (.)', 'Custom'] }
    ]
  },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', cat: 'text-tools', catName: 'Text & Typography', icon: '📄',
    desc: 'Generate placeholder text for design mockups and layouts. Choose the number of paragraphs, words, or sentences.',
    features: ['Paragraph, word, or sentence mode', 'Customizable count', 'Classic Lorem Ipsum text', 'Copy to clipboard', 'Preview in real-time'],
    faq: [
      ['What is Lorem Ipsum?', 'Lorem Ipsum is placeholder text used in the design and publishing industry since the 1500s.'],
      ['Is this real Latin?', 'It is derived from a Latin text by Cicero, but is intentionally scrambled to be unreadable.'],
    ],
    jsFile: 'lorem-ipsum.js',
    controls: [
      { type: 'select', id: 'loremType', label: 'Type', options: ['Paragraphs', 'Sentences', 'Words'] },
      { type: 'number', id: 'loremCount', label: 'Count', value: 5, unit: '' }
    ]
  },
  { id: 'text-diff', name: 'Text Diff Checker', cat: 'text-tools', catName: 'Text & Typography', icon: '🔍',
    desc: 'Compare two texts side by side and highlight the differences. Essential for proofreading and version comparison.',
    features: ['Side-by-side comparison', 'Highlighted differences', 'Line-by-line diff', 'Character-level diff', 'Ignore whitespace option'],
    faq: [
      ['How does the comparison work?', 'The tool compares both texts line by line and character by character, highlighting additions in green and deletions in red.'],
      ['Can I ignore certain differences?', 'Enable "Ignore whitespace" to skip differences in spacing and indentation.'],
    ],
    jsFile: 'text-diff.js',
    controls: [
      { type: 'toggle', id: 'ignoreWhitespace', label: 'Ignore Whitespace' }
    ]
  },
  { id: 'text-sorter', name: 'Text Sorter', cat: 'text-tools', catName: 'Text & Typography', icon: '📋',
    desc: 'Sort lines of text alphabetically, numerically, or by length. Reverse sort, remove duplicates, and organize text instantly.',
    features: ['Alphabetical sort (A-Z / Z-A)', 'Numeric sort', 'Sort by line length', 'Remove duplicates while sorting', 'Case-sensitive option'],
    faq: [
      ['Can I sort numbers correctly?', 'Yes, numeric sort handles numbers in their correct numerical order, not alphabetically.'],
      ['Does sorting remove duplicates?', 'Optionally — toggle "Remove duplicates" to deduplicate while sorting.'],
    ],
    jsFile: 'text-sorter.js',
    controls: [
      { type: 'select', id: 'sortOrder', label: 'Sort By', options: ['Alphabetical (A-Z)', 'Alphabetical (Z-A)', 'Numeric (Low-High)', 'Numeric (High-Low)', 'Length (Short-Long)', 'Length (Long-Short)'] },
      { type: 'toggle', id: 'sortDedup', label: 'Remove Duplicates' }
    ]
  },
  { id: 'text-formatter', name: 'Text Formatter', cat: 'text-tools', catName: 'Text & Typography', icon: '✨',
    desc: 'Clean and format text with proper spacing, line breaks, and indentation. Fix messy text copied from emails or documents.',
    features: ['Fix multiple spaces', 'Normalize line breaks', 'Trim trailing whitespace', 'Remove blank lines', 'Fix paragraph spacing'],
    faq: [
      ['What cleaning operations are available?', 'Remove extra spaces, normalize line breaks to single, trim trailing whitespace, remove blank lines, and capitalize sentences.'],
      ['Can I fix text copied from Word?', 'Yes! The formatter handles smart quotes, non-breaking spaces, and other formatting artifacts from word processors.'],
    ],
    jsFile: 'text-formatter.js',
    controls: [
      { type: 'toggle', id: 'fixSpaces', label: 'Fix Multiple Spaces', checked: true },
      { type: 'toggle', id: 'fixLineBreaks', label: 'Normalize Line Breaks', checked: true },
      { type: 'toggle', id: 'trimTrailing', label: 'Trim Trailing Whitespace', checked: true }
    ]
  },
  { id: 'whitespace-remover', name: 'Whitespace Remover', cat: 'text-tools', catName: 'Text & Typography', icon: '🗑️',
    desc: 'Remove extra spaces, tabs, line breaks, and all whitespace from text. Useful for data cleaning and code processing.',
    features: ['Remove all spaces', 'Remove tabs', 'Remove line breaks', 'Remove extra spaces only', 'Preserve single spaces option'],
    faq: [
      ['What whitespace can I remove?', 'All types: spaces, tabs, newlines, carriage returns, and non-breaking spaces.'],
      ['Can I keep single spaces between words?', 'Yes, choose "Remove extra spaces" to collapse multiple spaces to single spaces while keeping word separation.'],
    ],
    jsFile: 'whitespace-remover.js',
    controls: [
      { type: 'select', id: 'wsMode', label: 'Mode', options: ['Remove Extra Spaces', 'Remove All Spaces', 'Remove Tabs', 'Remove Line Breaks', 'Remove Everything'] }
    ]
  },
  { id: 'encoder-decoder', name: 'Text Encoder/Decoder', cat: 'text-tools', catName: 'Text & Typography', icon: '🔐',
    desc: 'Encode and decode text in Base64 and URL formats. Essential tool for web developers and data processing.',
    features: ['Base64 encode/decode', 'URL encode/decode', 'HTML entity encode/decode', 'One-click toggle', 'Copy result button'],
    faq: [
      ['What is Base64 encoding?', 'Base64 converts binary or text data into ASCII characters, commonly used for embedding data in URLs and emails.'],
      ['When would I use URL encoding?', 'URL encoding converts special characters to percent-encoded format (e.g., space becomes %20) for safe use in URLs.'],
    ],
    jsFile: 'encoder-decoder.js',
    controls: [
      { type: 'select', id: 'encType', label: 'Encoding', options: ['Base64', 'URL Encoding', 'HTML Entities'] }
    ]
  },
  { id: 'binary-ascii', name: 'Binary/ASCII Converter', cat: 'text-tools', catName: 'Text & Typography', icon: '💻',
    desc: 'Convert text to binary representation and back. View ASCII character codes and binary values for any text.',
    features: ['Text to binary', 'Binary to text', 'ASCII code display', 'Decimal code display', 'Hexadecimal display'],
    faq: [
      ['What is binary representation?', 'Binary represents each character as a sequence of 8 bits (0s and 1s) that computers use internally.'],
      ['Can I convert binary back to text?', 'Yes, paste valid binary (space-separated 8-bit values) and convert back to readable text.'],
    ],
    jsFile: 'binary-ascii.js',
    controls: [
      { type: 'select', id: 'binaryFormat', label: 'Output Format', options: ['Binary (8-bit)', 'Decimal', 'Hexadecimal', 'Octal'] }
    ]
  },

  // Category E: Conversion & Compression
  { id: 'format-converter', name: 'Format Converter', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '🔄', popular: true,
    desc: 'Convert images between PNG, JPG, WEBP, and other formats. Choose quality settings for optimal file size.',
    features: ['PNG, JPG, WEBP output', 'Adjustable quality slider', 'Batch conversion', 'Shows file size comparison', 'Instant conversion'],
    faq: [
      ['Which format should I choose?', 'PNG for graphics/transparency, JPG for photos (smaller files), WEBP for best compression with good quality.'],
      ['Does conversion reduce quality?', 'Converting from PNG to JPG may slightly reduce quality due to compression. PNG to PNG or JPG to JPG is lossless.'],
      ['What quality setting should I use?', '80-90% for JPG/WebP provides good balance between quality and file size. 95%+ for critical images.']
    ],
    jsFile: 'format-converter.js',
    controls: [
      { type: 'select', id: 'outputFormat', label: 'Output Format', options: ['PNG', 'JPEG', 'WEBP'] },
      { type: 'range', id: 'conversionQuality', label: 'Quality', min: 10, max: 100, value: 90, unit: '%' }
    ]
  },
  { id: 'compressor', name: 'Image Compressor', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '📦', popular: true,
    desc: 'Reduce image file size while maintaining visual quality. Upload an image, choose the target size, and download the optimized version.',
    features: ['Target file size option', 'Quality-based compression', 'Before/after size comparison', 'Visual quality preview', 'Batch compression'],
    faq: [
      ['How much can I compress?', 'Most images can be reduced by 50-80% with minimal visible quality loss. Results depend on the original format and content.'],
      ['Will compression be visible?', 'At moderate settings, compression artifacts are barely noticeable. Preview the result before downloading.'],
      ['What compression method is used?', 'We use browser-native canvas compression (quality parameter) which provides excellent results for JPEG and WebP output.']
    ],
    jsFile: 'compressor.js',
    controls: [
      { type: 'range', id: 'compressQuality', label: 'Quality', min: 1, max: 100, value: 80, unit: '%' },
      { type: 'select', id: 'compressFormat', label: 'Format', options: ['JPEG', 'WEBP', 'PNG'] }
    ]
  },
  { id: 'to-base64', name: 'Image to Base64', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '🔤',
    desc: 'Convert images to Base64 encoded strings for embedding in HTML, CSS, or data URIs.',
    features: ['Instant Base64 encoding', 'Copy-to-clipboard', 'Data URI format option', 'Shows encoded size', 'Supports all formats'],
    faq: [
      ['What is Base64?', 'Base64 is a way to encode binary data as ASCII text, commonly used for embedding images directly in HTML or CSS.'],
      ['When should I use Base64 images?', 'Small images (icons, logos) benefit from Base64 encoding. Large images should use standard file references for performance.'],
      ['How do I use the data URI?', 'Copy the output and use it as an image src: <img src="data:image/png;base64,..."> or in CSS url().']
    ],
    jsFile: 'to-base64.js',
    controls: [
      { type: 'toggle', id: 'dataUriPrefix', label: 'Include Data URI Prefix' }
    ]
  },
  { id: 'from-base64', name: 'Base64 to Image', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '🖼️',
    desc: 'Decode Base64 encoded strings back into viewable, downloadable images. Paste a data URI or raw Base64 string.',
    features: ['Paste Base64 string', 'Auto-detect format', 'Preview decoded image', 'Download as file', 'Shows decoded size'],
    faq: [
      ['What formats can be decoded?', 'Any image format that was encoded: PNG, JPG, WEBP, GIF, SVG, etc.'],
      ['Do I need the data URI prefix?', 'No, the tool works with or without the "data:image/..." prefix. It auto-detects the format.'],
    ],
    jsFile: 'from-base64.js',
    controls: []
  },
  { id: 'png-to-jpg', name: 'PNG to JPG', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '📷',
    desc: 'Convert PNG images to JPG format with adjustable quality. Perfect for reducing file sizes of photos and complex images.',
    features: ['Quality control slider', 'Transparent to white background', 'File size comparison', 'One-click conversion', 'Instant download'],
    faq: [
      ['What happens to transparency?', 'PNG transparency is replaced with a white background during JPG conversion. Choose your background color if needed.'],
      ['Why convert PNG to JPG?', 'JPG files are typically much smaller than PNG for photos and complex images with many colors.'],
    ],
    jsFile: 'png-to-jpg.js',
    controls: [
      { type: 'range', id: 'jpgQuality', label: 'Quality', min: 10, max: 100, value: 90, unit: '%' },
      { type: 'color', id: 'jpgBgColor', label: 'Background (for transparency)', value: '#ffffff' }
    ]
  },
  { id: 'jpg-to-png', name: 'JPG to PNG', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '🏞️',
    desc: 'Convert JPG images to PNG format for lossless quality and transparency support. Ideal for graphics and screenshots.',
    features: ['Lossless conversion', 'No quality degradation', 'Supports future transparency editing', 'Instant processing', 'Original quality preserved'],
    faq: [
      ['Why convert JPG to PNG?', 'PNG is lossless, so converting preserves all detail. It\'s also necessary when you need transparency support for editing.'],
      ['Will the file be bigger?', 'Yes, PNG files are typically larger than JPG, but they preserve all image quality without compression artifacts.'],
    ],
    jsFile: 'jpg-to-png.js',
    controls: []
  },
  { id: 'to-pdf', name: 'Image to PDF', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '📑',
    desc: 'Convert a single image to PDF format. Perfect for creating printable documents from photos and scanned images.',
    features: ['Single image to PDF', 'Page size options', 'Orientation selection', 'Margin control', 'Instant PDF generation'],
    faq: [
      ['What page sizes are available?', 'A4, Letter, Legal, and custom sizes. You can also match the image dimensions.'],
      ['Is this a real PDF?', 'Yes, the tool generates a valid PDF file that can be opened in any PDF reader and printed.'],
    ],
    jsFile: 'to-pdf.js',
    controls: [
      { type: 'select', id: 'pdfPageSize', label: 'Page Size', options: ['A4', 'Letter', 'Legal', 'Fit to Image'] },
      { type: 'select', id: 'pdfOrientation', label: 'Orientation', options: ['Auto', 'Portrait', 'Landscape'] }
    ]
  },
  { id: 'multi-to-pdf', name: 'Multiple Images to PDF', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '📚',
    desc: 'Combine multiple images into a single PDF document. Upload several images and create a multi-page PDF.',
    features: ['Multiple image upload', 'Drag to reorder pages', 'Page size options', 'Multi-page PDF output', 'Download single PDF'],
    faq: [
      ['How many images can I add?', 'You can add up to 50 images in a single PDF.'],
      ['Can I reorder pages?', 'Yes, drag and drop to rearrange the page order before generating the PDF.'],
      ['Does each image become a page?', 'Yes, each image is placed on its own page in the PDF, fitted to the selected page size.']
    ],
    jsFile: 'multi-to-pdf.js',
    controls: [
      { type: 'select', id: 'multiPdfSize', label: 'Page Size', options: ['A4', 'Letter', 'Legal', 'Fit to Image'] }
    ]
  },
  { id: 'dpi-changer', name: 'Image DPI Changer', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '🖨️',
    desc: 'Change the DPI/PPI metadata of images for print or web use. Common DPI values: 72 (screen), 300 (print), 600 (high-quality print).',
    features: ['Common DPI presets', 'Custom DPI input', 'Print size preview', 'Preserves pixel dimensions', 'Metadata update'],
    faq: [
      ['What is DPI?', 'DPI (Dots Per Inch) or PPI (Pixels Per Inch) determines the physical print size of an image. Higher DPI = smaller print size at same pixel dimensions.'],
      ['Does changing DPI alter the image?', 'Changing DPI only modifies metadata — the actual pixels are unchanged. The visual quality on screen remains the same.'],
      ['What DPI should I use?', '72 for web, 300 for standard print, 600 for high-quality print or scanning.']
    ],
    jsFile: 'dpi-changer.js',
    controls: [
      { type: 'select', id: 'dpiValue', label: 'DPI', options: ['72 (Web)', '96 (Standard Screen)', '150 (Draft Print)', '300 (Print Quality)', '600 (High Quality Print)', 'Custom'] },
      { type: 'number', id: 'customDpi', label: 'Custom DPI', value: 300, unit: '' }
    ]
  },
  { id: 'file-reducer', name: 'File Size Reducer', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '📉',
    desc: 'Reduce image file size to meet upload requirements. Set a target file size and the tool adjusts quality automatically.',
    features: ['Target file size input', 'Auto quality adjustment', 'Before/after comparison', 'Multiple format options', 'Shows savings percentage'],
    faq: [
      ['How does it achieve a specific file size?', 'The tool uses binary search on the quality parameter to find the highest quality that meets your target file size.'],
      ['What if the target is too low?', 'Very aggressive targets may significantly reduce visual quality. The tool warns if the result looks poor.'],
    ],
    jsFile: 'file-reducer.js',
    controls: [
      { type: 'select', id: 'targetSize', label: 'Target Size', options: ['100 KB', '250 KB', '500 KB', '1 MB', '2 MB', 'Custom'] },
      { type: 'select', id: 'reducerFormat', label: 'Output Format', options: ['JPEG', 'WEBP', 'PNG'] }
    ]
  },
  { id: 'svg-to-png', name: 'SVG to PNG', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '📊',
    desc: 'Convert SVG vector graphics to PNG raster images at any resolution. Choose the output size for crisp rendering.',
    features: ['Any output resolution', 'Crisp vector rendering', 'Transparent background', 'Scale factor option', 'Custom dimensions'],
    faq: [
      ['Why convert SVG to PNG?', 'SVGs aren\'t supported everywhere. PNG conversion is needed for social media, some editors, and older browsers.'],
      ['What resolution should I use?', 'Higher resolutions (2x, 4x) produce crisper results. Use at least 2x the display size for retina screens.'],
    ],
    jsFile: 'svg-to-png.js',
    controls: [
      { type: 'number', id: 'svgWidth', label: 'Width', value: 512, unit: 'px' },
      { type: 'number', id: 'svgHeight', label: 'Height', value: 512, unit: 'px' },
      { type: 'select', id: 'svgScale', label: 'Scale', options: ['1x', '2x', '3x', '4x'] }
    ]
  },
  { id: 'favicon-gen', name: 'Favicon Generator', cat: 'conversion-compression', catName: 'Conversion & Compression', icon: '⭐',
    desc: 'Generate favicons in all required sizes from any image. Creates 16×16, 32×32, 48×48, and 180×180 Apple Touch Icon.',
    features: ['All required favicon sizes', 'ICO format support', 'Apple Touch Icon', 'Android Chrome icon', 'Preview and download'],
    faq: [
      ['What sizes are generated?', '16×16, 32×32, 48×48, 64×64, 128×128, 180×180 (Apple), and 192×192 (Android).'],
      ['What format should I use?', 'ICO for universal browser support, PNG for modern browsers, include both for best compatibility.'],
      ['How do I add it to my site?', 'Add the link tag to your HTML head: <link rel="icon" href="/favicon.ico" sizes="any">']
    ],
    jsFile: 'favicon-gen.js',
    controls: [
      { type: 'toggle', id: 'includeIco', label: 'Include ICO Format' },
      { type: 'color', id: 'faviconBg', label: 'Background', value: '#ffffff' }
    ]
  },

  // Category F: Color Tools
  { id: 'color-picker-img', name: 'Color Picker from Image', cat: 'color-tools', catName: 'Color Tools', icon: '💉', popular: true,
    desc: 'Pick any color from an image by clicking on it. Get the HEX, RGB, and HSL values of any pixel in your photo.',
    features: ['Click to pick color', 'Zoom for precision', 'HEX, RGB, HSL values', 'Copy color code', 'Color history'],
    faq: [
      ['How do I pick a color?', 'Upload an image and click on any pixel to extract its color. The color values are displayed instantly.'],
      ['Can I zoom in for precision?', 'Yes, the tool provides zoom functionality to pick exact pixels.'],
      ['What color formats are shown?', 'HEX (#ff0000), RGB (255, 0, 0), and HSL (0, 100%, 50%) are all displayed.']
    ],
    jsFile: 'color-picker-img.js',
    controls: []
  },
  { id: 'color-converter', name: 'HEX/RGB/HSL Converter', cat: 'color-tools', catName: 'Color Tools', icon: '🎨',
    desc: 'Convert between HEX, RGB, and HSL color formats instantly. Enter any format and see all conversions at once.',
    features: ['All format conversion', 'Visual color preview', 'Copy any format', 'Color picker input', 'Real-time updates'],
    faq: [
      ['What color formats are supported?', 'HEX (#ff0000), RGB (rgb(255, 0, 0)), HSL (hsl(0, 100%, 50%)), and CSS function formats.'],
      ['Which format should I use?', 'HEX is common for web design, RGB for image editing, and HSL for intuitive color adjustment.'],
    ],
    jsFile: 'color-converter.js',
    controls: [
      { type: 'color', id: 'inputColor', label: 'Pick Color', value: '#4f46e5' },
      { type: 'text', id: 'hexInput', label: 'HEX', placeholder: '#4f46e5' },
      { type: 'text', id: 'rgbInput', label: 'RGB', placeholder: 'rgb(79, 70, 229)' },
      { type: 'text', id: 'hslInput', label: 'HSL', placeholder: 'hsl(239, 84%, 59%)' }
    ]
  },
  { id: 'palette-extractor', name: 'Palette from Image', cat: 'color-tools', catName: 'Color Tools', icon: '🌈',
    desc: 'Extract the dominant color palette from any image. Identify the most used colors with their hex values and percentages.',
    features: ['Extracts 5-10 dominant colors', 'Color percentage display', 'Copy hex values', 'Color frequency chart', 'Works on any image'],
    faq: [
      ['How many colors are extracted?', 'By default, 8 dominant colors are extracted, with their relative frequency shown as percentages.'],
      ['How accurate is the extraction?', 'Uses median-cut color quantization algorithm, which provides good results for most images.'],
    ],
    jsFile: 'palette-extractor.js',
    controls: [
      { type: 'number', id: 'paletteCount', label: 'Number of Colors', value: 8, unit: '' }
    ]
  },
  { id: 'gradient-gen', name: 'Gradient Generator', cat: 'color-tools', catName: 'Color Tools', icon: '🌅', popular: true,
    desc: 'Create custom CSS gradients with live visual preview. Linear, radial, and conic gradient options with multiple color stops.',
    features: ['Linear, radial, conic gradients', 'Multiple color stops', 'Angle/direction control', 'Copy CSS code', 'Preview in real-time'],
    faq: [
      ['What gradient types are available?', 'Linear (directional), radial (circular from center), and conic (rotational) gradients.'],
      ['How do I add more color stops?', 'Click on the gradient bar to add new stops. Drag them to adjust positions.'],
      ['How do I use the CSS code?', 'Copy the generated CSS and paste it into your stylesheet. It includes all vendor prefixes for compatibility.']
    ],
    jsFile: 'gradient-gen.js',
    controls: [
      { type: 'select', id: 'gradType', label: 'Type', options: ['Linear', 'Radial', 'Conic'] },
      { type: 'range', id: 'gradAngle', label: 'Angle', min: 0, max: 360, value: 135, unit: '°' },
      { type: 'color', id: 'gradColor1', label: 'Color 1', value: '#667eea' },
      { type: 'color', id: 'gradColor2', label: 'Color 2', value: '#764ba2' }
    ]
  },
  { id: 'contrast-checker', name: 'Contrast Checker', cat: 'color-tools', catName: 'Color Tools', icon: '♿',
    desc: 'Check text and background color contrast ratios for WCAG accessibility compliance. Essential for inclusive web design.',
    features: ['WCAG AA/AAA rating', 'Contrast ratio display', 'Foreground/background colors', 'Text preview', 'Fix suggestions'],
    faq: [
      ['What is WCAG?', 'Web Content Accessibility Guidelines define standards for accessible design. Contrast ratios ensure text is readable.'],
      ['What ratio do I need?', 'WCAG AA requires 4.5:1 for normal text, 3:1 for large text. AAA requires 7:1 and 4.5:1 respectively.'],
    ],
    jsFile: 'contrast-checker.js',
    controls: [
      { type: 'color', id: 'fgColor', label: 'Text Color', value: '#000000' },
      { type: 'color', id: 'bgColorCheck', label: 'Background Color', value: '#ffffff' }
    ]
  },
  { id: 'random-color', name: 'Random Color Generator', cat: 'color-tools', catName: 'Color Tools', icon: '🎲',
    desc: 'Generate beautiful random colors and palettes. Click to get new colors, copy hex values, and explore color spaces.',
    features: ['Single random color', 'Generate 5-color palette', 'Copy with one click', 'Color history', 'Lock specific colors'],
    faq: [
      ['How do I generate colors?', 'Click the "Generate" button or press Space to get a new random color. Click any color to copy its hex value.'],
      ['Can I generate only specific hues?', 'Yes, use the hue filter to generate random colors within a specific color range.'],
    ],
    jsFile: 'random-color.js',
    controls: [
      { type: 'range', id: 'hueRange', label: 'Hue Range', min: 0, max: 360, value: 360, unit: '°' },
      { type: 'range', id: 'satRange', label: 'Min Saturation', min: 0, max: 100, value: 50, unit: '%' }
    ]
  },
  { id: 'color-blender', name: 'Color Blender/Mixer', cat: 'color-tools', catName: 'Color Tools', icon: '🧪',
    desc: 'Mix two colors and generate intermediate shades. Create smooth color ramps and find the perfect middle ground.',
    features: ['Mix any two colors', 'Adjustable mix ratio', 'Generate 5-step gradient', 'Copy all shades', 'Visual mix preview'],
    faq: [
      ['How do I mix colors?', 'Select two colors and use the slider to adjust the mix ratio. The result updates in real time.'],
      ['Can I generate a multi-step gradient?', 'Yes, the tool can generate 3, 5, 7, or 9 intermediate steps between your colors.'],
    ],
    jsFile: 'color-blender.js',
    controls: [
      { type: 'color', id: 'blendColor1', label: 'Color 1', value: '#ff0000' },
      { type: 'color', id: 'blendColor2', label: 'Color 2', value: '#0000ff' },
      { type: 'range', id: 'blendRatio', label: 'Mix Ratio', min: 0, max: 100, value: 50, unit: '%' }
    ]
  },
  { id: 'complementary', name: 'Complementary Colors', cat: 'color-tools', catName: 'Color Tools', icon: '🔄',
    desc: 'Find complementary, analogous, triadic, and split-complementary color schemes from any base color.',
    features: ['Complementary colors', 'Analogous scheme', 'Triadic scheme', 'Split-complementary', 'Copy all values'],
    faq: [
      ['What are complementary colors?', 'Complementary colors are opposite each other on the color wheel, creating high contrast when paired.'],
      ['What is a triadic scheme?', 'Triadic colors are evenly spaced around the color wheel (120° apart), creating vibrant, balanced palettes.'],
    ],
    jsFile: 'complementary.js',
    controls: [
      { type: 'color', id: 'baseColor', label: 'Base Color', value: '#4f46e5' }
    ]
  },
  { id: 'dominant-color', name: 'Dominant Color Extractor', cat: 'color-tools', catName: 'Color Tools', icon: '🎯',
    desc: 'Find the most dominant colors in any image. Analyzes pixel data to determine the top colors used in your photos.',
    features: ['Top 5 dominant colors', 'Percentage breakdown', 'Color swatches', 'Copy hex values', 'Works on any image'],
    faq: [
      ['How does it work?', 'The tool analyzes all pixels in the image and clusters them by color similarity to find the most frequently occurring colors.'],
      ['How many colors does it find?', 'By default, it finds the top 5 most dominant colors with their percentage of total pixels.'],
    ],
    jsFile: 'dominant-color.js',
    controls: [
      { type: 'number', id: 'dominantCount', label: 'Colors to Find', value: 5, unit: '' }
    ]
  },
  { id: 'css-gradient', name: 'CSS Gradient Code', cat: 'color-tools', catName: 'Color Tools', icon: '💻',
    desc: 'Generate copy-ready CSS gradient code with live preview. Create beautiful backgrounds for web design projects.',
    features: ['Live CSS preview', 'Copy-ready code', 'Multiple gradient layers', 'Browser compatibility', 'Code syntax highlighting'],
    faq: [
      ['Is the code production-ready?', 'Yes, the generated CSS includes all necessary properties and vendor prefixes for cross-browser compatibility.'],
      ['Can I stack multiple gradients?', 'Yes, add multiple gradient layers that stack on top of each other for complex background effects.'],
    ],
    jsFile: 'css-gradient.js',
    controls: [
      { type: 'select', id: 'cssGradType', label: 'Type', options: ['Linear', 'Radial'] },
      { type: 'color', id: 'cssGrad1', label: 'Color 1', value: '#667eea' },
      { type: 'color', id: 'cssGrad2', label: 'Color 2', value: '#764ba2' },
      { type: 'range', id: 'cssGradAngle', label: 'Angle', min: 0, max: 360, value: 135, unit: '°' }
    ]
  },

  // Category G: Design & Creative
  { id: 'qr-gen', name: 'QR Code Generator', cat: 'design-creative', catName: 'Design & Creative', icon: '📱', popular: true,
    desc: 'Generate QR codes for URLs, text, emails, phone numbers, and WiFi passwords. Download as PNG at various sizes.',
    features: ['URL, text, email, phone, WiFi', 'Customizable colors', 'Multiple sizes', 'Error correction levels', 'Instant generation'],
    faq: [
      ['What data types are supported?', 'URLs, plain text, email addresses, phone numbers, SMS messages, WiFi credentials, and vCard contact info.'],
      ['Can I customize the colors?', 'Yes, choose foreground and background colors. Ensure sufficient contrast for reliable scanning.'],
      ['What size should I use?', 'At least 200×200px for screen display, 300×300px for printing. Larger sizes scan more reliably.']
    ],
    jsFile: 'qr-gen.js',
    controls: [
      { type: 'select', id: 'qrType', label: 'Type', options: ['URL', 'Text', 'Email', 'Phone', 'WiFi'] },
      { type: 'text', id: 'qrContent', label: 'Content', placeholder: 'Enter URL or text...' },
      { type: 'color', id: 'qrColor', label: 'QR Color', value: '#000000' },
      { type: 'select', id: 'qrSize', label: 'Size', options: ['200×200', '300×300', '400×400', '500×500'] }
    ]
  },
  { id: 'barcode-gen', name: 'Barcode Generator', cat: 'design-creative', catName: 'Design & Creative', icon: '📊',
    desc: 'Generate barcodes in various formats including Code128, Code39, EAN-13, and UPC-A. Download as PNG.',
    features: ['Multiple barcode formats', 'Customizable width/height', 'Text below barcode', 'Print-ready quality', 'Instant generation'],
    faq: [
      ['Which barcode format should I use?', 'Code128 is the most versatile for general use. EAN-13 for retail products. Code39 for alphanumeric data.'],
      ['Can I print the barcodes?', 'Yes, generate at high resolution (300+ DPI) for print-quality barcodes.'],
    ],
    jsFile: 'barcode-gen.js',
    controls: [
      { type: 'select', id: 'barcodeFormat', label: 'Format', options: ['Code128', 'Code39', 'EAN-13', 'UPC-A'] },
      { type: 'text', id: 'barcodeData', label: 'Data', placeholder: 'Enter data...' },
      { type: 'range', id: 'barcodeWidth', label: 'Bar Width', min: 1, max: 5, value: 2, unit: 'px' }
    ]
  },
  { id: 'watermark', name: 'Watermark Adder', cat: 'design-creative', catName: 'Design & Creative', icon: '💧',
    desc: 'Add text or image watermarks to protect your photos. Control position, opacity, size, and rotation of watermarks.',
    features: ['Text watermark support', 'Adjustable opacity', 'Position and rotation control', 'Tiled/repeated option', 'Preview before download'],
    faq: [
      ['Can I add image watermarks?', 'Currently, text watermarks are fully supported. Upload a transparent PNG logo for semi-image watermarks.'],
      ['How do I make the watermark subtle?', 'Reduce the opacity to 10-30% for a subtle watermark that doesn\'t distract from the image.'],
    ],
    jsFile: 'watermark.js',
    controls: [
      { type: 'text', id: 'watermarkText', label: 'Watermark Text', placeholder: '© Your Name' },
      { type: 'range', id: 'watermarkOpacity', label: 'Opacity', min: 5, max: 100, value: 30, unit: '%' },
      { type: 'range', id: 'watermarkSize', label: 'Size', min: 12, max: 120, value: 36, unit: 'px' },
      { type: 'select', id: 'watermarkPos', label: 'Position', options: ['Center', 'Bottom Right', 'Bottom Left', 'Top Right', 'Top Left', 'Tiled'] }
    ]
  },
  { id: 'signature', name: 'Signature Maker', cat: 'design-creative', catName: 'Design & Creative', icon: '✍️',
    desc: 'Draw your signature using mouse or touchscreen, then download it as a transparent PNG for documents and emails.',
    features: ['Draw with mouse/touch', 'Adjustable pen thickness', 'Multiple pen colors', 'Transparent background', 'Clear and redo'],
    faq: [
      ['How do I draw my signature?', 'Use your mouse or finger (on touch devices) to draw in the signature area. Click "Clear" to start over.'],
      ['Can I change the pen color?', 'Yes, choose from black, dark blue, or custom colors for your signature pen.'],
      ['Is the background transparent?', 'Yes, the downloaded PNG has a transparent background so it overlays cleanly on documents.']
    ],
    jsFile: 'signature.js',
    controls: [
      { type: 'range', id: 'penSize', label: 'Pen Thickness', min: 1, max: 10, value: 3, unit: 'px' },
      { type: 'color', id: 'penColor', label: 'Pen Color', value: '#000000' }
    ]
  },
  { id: 'border-frame', name: 'Border/Frame Adder', cat: 'design-creative', catName: 'Design & Creative', icon: '🖼️',
    desc: 'Add decorative borders and frames to images. Choose from solid borders, dashed, double lines, and more.',
    features: ['Adjustable border width', 'Multiple border styles', 'Custom border color', 'Corner radius option', 'Real-time preview'],
    faq: [
      ['What border styles are available?', 'Solid, dashed, dotted, double, groove, ridge, inset, and outset border styles.'],
      ['Can I have different colors on each side?', 'Set individual top, right, bottom, and left border colors for multi-colored frames.'],
    ],
    jsFile: 'border-frame.js',
    controls: [
      { type: 'range', id: 'borderWidth', label: 'Border Width', min: 1, max: 50, value: 10, unit: 'px' },
      { type: 'color', id: 'borderColor', label: 'Border Color', value: '#000000' },
      { type: 'select', id: 'borderStyle', label: 'Style', options: ['Solid', 'Dashed', 'Dotted', 'Double'] }
    ]
  },
  { id: 'sticker-overlay', name: 'Sticker/Emoji Overlay', cat: 'design-creative', catName: 'Design & Creative', icon: '😊',
    desc: 'Add stickers and emoji overlays to your photos. Choose from popular emojis, resize and position them on your image.',
    features: ['Large emoji collection', 'Drag to position', 'Resize controls', 'Rotate stickers', 'Multiple stickers'],
    faq: [
      ['How do I add a sticker?', 'Click any emoji from the collection to add it to your image. Drag to reposition and use handles to resize.'],
      ['Can I add multiple stickers?', 'Yes, add as many stickers as you want. Each one can be independently positioned, sized, and rotated.'],
    ],
    jsFile: 'sticker-overlay.js',
    controls: [
      { type: 'range', id: 'stickerSize', label: 'Size', min: 24, max: 200, value: 64, unit: 'px' }
    ]
  },
  { id: 'photo-grid', name: 'Photo Grid/Layout', cat: 'design-creative', catName: 'Design & Creative', icon: '⊞',
    desc: 'Arrange photos in beautiful grid layouts. Choose from various grid patterns and customize spacing and colors.',
    features: ['Multiple grid layouts', 'Drag to rearrange', 'Customizable spacing', 'Background color', 'High-resolution output'],
    faq: [
      ['How many layout options are available?', 'Over 10 grid layouts including 2×2, 3×3, asymmetric, and creative arrangements.'],
      ['Can I adjust the spacing between photos?', 'Yes, control the gap size between photos and the overall padding around the grid.'],
    ],
    jsFile: 'photo-grid.js',
    controls: [
      { type: 'select', id: 'gridLayout', label: 'Layout', options: ['2×2 Equal', '3×3 Equal', '2×2 Pinterest', '1+2 Layout', '3 Column Masonry'] },
      { type: 'range', id: 'gridSpacing', label: 'Spacing', min: 0, max: 30, value: 8, unit: 'px' },
      { type: 'color', id: 'gridBgColor', label: 'Background', value: '#ffffff' }
    ]
  },
  { id: 'biz-card', name: 'Business Card Template', cat: 'design-creative', catName: 'Design & Creative', icon: '💼',
    desc: 'Create business card templates with standard dimensions (3.5×2 inches). Add name, title, contact info and download.',
    features: ['Standard 3.5×2 inch size', 'Front and back design', 'Customizable colors', 'Text fields for contact info', 'Print-ready PDF/PNG'],
    faq: [
      ['What are the standard business card dimensions?', 'Standard US business card size is 3.5 × 2 inches (350 × 200 px at 100 DPI, or 1050 × 600 at 300 DPI).'],
      ['Can I print the result?', 'Yes, download at 300 DPI for print-quality output. Most print shops accept PNG or PDF files.'],
    ],
    jsFile: 'biz-card.js',
    controls: [
      { type: 'text', id: 'cardName', label: 'Name', placeholder: 'John Doe' },
      { type: 'text', id: 'cardTitle', label: 'Title', placeholder: 'Web Developer' },
      { type: 'text', id: 'cardEmail', label: 'Email', placeholder: 'john@example.com' },
      { type: 'color', id: 'cardColor', label: 'Accent Color', value: '#4f46e5' }
    ]
  },
  { id: 'rounded-corners', name: 'Rounded Corners', cat: 'design-creative', catName: 'Design & Creative', icon: '🔲',
    desc: 'Add rounded corners to images with adjustable radius. Create smooth, modern-looking images with customizable corner roundness.',
    features: ['Adjustable corner radius', 'Individual corner control', 'Transparent output', 'Preview with checkerboard', 'Download as PNG'],
    faq: [
      ['Will the corners be transparent?', 'Yes, the output is a PNG with transparent corners, perfect for overlaying on backgrounds.'],
      ['Can I round only specific corners?', 'Yes, control each corner\'s radius independently for asymmetric rounding.'],
    ],
    jsFile: 'rounded-corners.js',
    controls: [
      { type: 'range', id: 'cornerRadius', label: 'Corner Radius', min: 0, max: 200, value: 20, unit: 'px' }
    ]
  },
  { id: 'bg-changer', name: 'ID Photo BG Changer', cat: 'design-creative', catName: 'Design & Creative', icon: '🪪',
    desc: 'Change the background color of ID photos. Select a solid color to replace the existing background for passport and ID requirements.',
    features: ['Solid color backgrounds', 'Common ID photo colors', 'Brush-based selection', 'Undo support', 'Standard ID dimensions'],
    faq: [
      ['How does background changing work?', 'Use the brush to mark foreground (keep) and background (replace) areas, then select a new background color.'],
      ['What background colors are available?', 'White, light blue, light gray, and any custom color. Common ID photo backgrounds are white and light blue.'],
    ],
    jsFile: 'bg-changer.js',
    controls: [
      { type: 'color', id: 'newBgColor', label: 'New Background', value: '#ffffff' },
      { type: 'range', id: 'bgBrushSize', label: 'Brush Size', min: 5, max: 50, value: 20, unit: 'px' },
      { type: 'select', id: 'bgBrushMode', label: 'Brush Mode', options: ['Foreground (Keep)', 'Background (Remove)'] }
    ]
  },

  // Category H: Utility & Misc
  { id: 'exif-viewer', name: 'EXIF Data Viewer', cat: 'utility-misc', catName: 'Utility & Misc', icon: '📋',
    desc: 'View EXIF metadata from images including camera model, date taken, GPS coordinates, and exposure settings.',
    features: ['Camera information', 'Date and time taken', 'GPS coordinates', 'Exposure settings', 'Thumbnail preview'],
    faq: [
      ['What EXIF data is shown?', 'Camera make/model, date/time, resolution, focal length, aperture, shutter speed, ISO, GPS coordinates, and more.'],
      ['Why is some data missing?', 'Not all cameras record all EXIF fields. The tool displays whatever data is available in the image.'],
    ],
    jsFile: 'exif-viewer.js',
    controls: []
  },
  { id: 'screenshot-beautifier', name: 'Screenshot Beautifier', cat: 'utility-misc', catName: 'Utility & Misc', icon: '📸',
    desc: 'Add professional browser frames, shadows, and backgrounds to screenshots. Make your screenshots look polished and presentable.',
    features: ['macOS/Windows browser frame', 'Adjustable shadow', 'Custom background color', 'Multiple frame styles', 'Export at 2x resolution'],
    faq: [
      ['What frame styles are available?', 'macOS (with red/yellow/green dots), Windows, and generic browser frames.'],
      ['Can I change the background?', 'Yes, choose any solid color, gradient, or transparent background for the frame.'],
    ],
    jsFile: 'screenshot-beautifier.js',
    controls: [
      { type: 'select', id: 'frameStyle', label: 'Frame Style', options: ['macOS', 'Windows', 'Generic Browser', 'None'] },
      { type: 'range', id: 'shadowIntensity', label: 'Shadow', min: 0, max: 100, value: 50, unit: '%' },
      { type: 'color', id: 'frameBg', label: 'Background', value: '#e2e8f0' }
    ]
  },
  { id: 'compare-slider', name: 'Image Comparison', cat: 'utility-misc', catName: 'Utility & Misc', icon: '↔️',
    desc: 'Compare two images with an interactive before/after slider. Perfect for showing editing results and before/after transformations.',
    features: ['Interactive drag slider', 'Upload two images', 'Before/after labels', 'Fullscreen view', 'Screenshot comparison'],
    faq: [
      ['How do I compare images?', 'Upload the "before" image first, then the "after" image. Drag the slider left and right to compare.'],
      ['Can I save the comparison?', 'Take a screenshot of the comparison view, or use the export function to save the combined view.'],
    ],
    jsFile: 'compare-slider.js',
    controls: []
  },
  { id: 'file-calculator', name: 'File Size Calculator', cat: 'utility-misc', catName: 'Utility & Misc', icon: '🧮',
    desc: 'Calculate image file sizes based on dimensions, format, and quality settings. Estimate sizes before processing.',
    features: ['Multi-format calculation', 'Quality impact preview', 'Bits-per-pixel display', 'Compression estimates', 'Batch calculation'],
    faq: [
      ['How accurate are the estimates?', 'Estimates are based on typical compression ratios for each format. Actual sizes may vary ±20% depending on image content.'],
      ['Which format produces the smallest files?', 'WEBP generally produces the smallest files, followed by JPEG, then PNG.'],
    ],
    jsFile: 'file-calculator.js',
    controls: [
      { type: 'number', id: 'calcWidth', label: 'Width', value: 1920, unit: 'px' },
      { type: 'number', id: 'calcHeight', label: 'Height', value: 1080, unit: 'px' },
      { type: 'select', id: 'calcFormat', label: 'Format', options: ['PNG', 'JPEG', 'WEBP'] },
      { type: 'range', id: 'calcQuality', label: 'Quality', min: 10, max: 100, value: 85, unit: '%' }
    ]
  },
  { id: 'aspect-calculator', name: 'Aspect Ratio Calculator', cat: 'utility-misc', catName: 'Utility & Misc', icon: '📐',
    desc: 'Calculate and find equivalent aspect ratios. Enter width and height to find the ratio, or enter ratio to find compatible dimensions.',
    features: ['Calculate from dimensions', 'Find equivalent sizes', 'Common ratio presets', 'Lock ratio calculator', 'Visual representation'],
    faq: [
      ['How do I calculate an aspect ratio?', 'Enter width and height, and the tool simplifies to the simplest ratio (e.g., 1920×1080 → 16:9).'],
      ['What are common aspect ratios?', '1:1 (square), 4:3 (standard), 16:9 (widescreen), 4:5 (portrait), 9:16 (stories), 21:9 (ultrawide).'],
    ],
    jsFile: 'aspect-calculator.js',
    controls: [
      { type: 'number', id: 'ratioWidth', label: 'Width', value: 1920, unit: 'px' },
      { type: 'number', id: 'ratioHeight', label: 'Height', value: 1080, unit: 'px' }
    ]
  },
  { id: 'px-converter', name: 'Pixel to Unit Converter', cat: 'utility-misc', catName: 'Utility & Misc', icon: '📏',
    desc: 'Convert between pixels, centimeters, inches, millimeters, and points. Essential for print and web design.',
    features: ['Multiple unit support', 'DPI-aware conversion', 'Bidirectional conversion', 'Print size preview', 'Common DPI presets'],
    faq: [
      ['Why does DPI matter?', 'Pixels don\'t have a physical size until assigned a DPI. At 300 DPI, 300 pixels = 1 inch. At 72 DPI, 72 pixels = 1 inch.'],
      ['What DPI should I use for conversion?', 'Use 96 DPI for web, 300 DPI for standard print, 600 DPI for high-quality print.'],
    ],
    jsFile: 'px-converter.js',
    controls: [
      { type: 'number', id: 'pxValue', label: 'Pixels', value: 100, unit: 'px' },
      { type: 'number', id: 'converterDpi', label: 'DPI', value: 96, unit: 'DPI' }
    ]
  },
  { id: 'meta-stripper', name: 'Metadata Stripper', cat: 'utility-misc', catName: 'Utility & Misc', icon: '🔒',
    desc: 'Remove all metadata from images for privacy. Strips EXIF, GPS, camera info, and other metadata before sharing online.',
    features: ['Strips all EXIF data', 'Removes GPS location', 'Removes camera information', 'Preview metadata removed', 'Privacy-focused'],
    faq: [
      ['Why should I remove metadata?', 'Metadata can contain sensitive information like GPS location, camera serial numbers, and personal details.'],
      ['Does stripping reduce file size?', 'Yes, removing metadata slightly reduces file size since the metadata bytes are eliminated.'],
      ['Is the original file modified?', 'No, a new metadata-free copy is created. Your original file remains unchanged.'],
    ],
    jsFile: 'meta-stripper.js',
    controls: []
  },
  { id: 'clipboard-paste', name: 'Clipboard Image Tool', cat: 'utility-misc', catName: 'Utility & Misc', icon: '📋',
    desc: 'Paste images directly from your clipboard using Ctrl+V. Edit, convert, or save clipboard images without saving to disk first.',
    features: ['Ctrl+V paste support', 'Auto-detect clipboard images', 'Edit pasted images', 'Convert format', 'Save to disk'],
    faq: [
      ['How do I paste an image?', 'Copy an image (right-click > Copy, or screenshot), then press Ctrl+V (or Cmd+V on Mac) on this page.'],
      ['What sources can I paste from?', 'Any source that copies images to clipboard: screenshots, web images, photo editors, and more.'],
      ['Does this work on mobile?', 'On mobile, you can use the file upload as an alternative to clipboard paste.'],
    ],
    jsFile: 'clipboard-paste.js',
    controls: []
  }
];

const ALL_TOOLS = [...TOOLS, ...MORE_TOOLS];

// ── HTML Template ──
function generateToolPage(tool) {
  const siteUrl = 'https://editprohub.com';
  const pageUrl = `${siteUrl}/tools/${tool.cat}/${tool.id}.html`;

  const controlsHTML = (tool.controls || []).map(ctrl => {
    switch (ctrl.type) {
      case 'range':
        return `
          <div class="control-group">
            <label>${ctrl.label} <span class="value" id="${ctrl.id}-value">${ctrl.value}${ctrl.unit || ''}</span></label>
            <input type="range" id="${ctrl.id}" min="${ctrl.min}" max="${ctrl.max}" value="${ctrl.value}" step="${ctrl.step || 1}">
          </div>`;
      case 'number':
        return `
          <div class="control-group">
            <label>${ctrl.label}</label>
            <input type="number" id="${ctrl.id}" value="${ctrl.value}" min="0">
          </div>`;
      case 'select':
        return `
          <div class="control-group">
            <label>${ctrl.label}</label>
            <select id="${ctrl.id}">
              ${ctrl.options.map((o, i) => `<option value="${i === 0 ? '0' : i}" ${i === 0 ? 'selected' : ''}>${o}</option>`).join('')}
            </select>
          </div>`;
      case 'color':
        return `
          <div class="control-group">
            <label>${ctrl.label}</label>
            <input type="color" id="${ctrl.id}" value="${ctrl.value}">
          </div>`;
      case 'toggle':
        return `
          <div class="toggle-group">
            <label>${ctrl.label}</label>
            <label class="toggle"><input type="checkbox" id="${ctrl.id}"${ctrl.checked ? ' checked' : ''}><span class="toggle-slider"></span></label>
          </div>`;
      case 'text':
        return `
          <div class="control-group">
            <label>${ctrl.label}</label>
            <input type="text" id="${ctrl.id}" placeholder="${ctrl.placeholder || ''}" style="width:100%;padding:var(--space-2) var(--space-3);border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg);color:var(--text-primary);font-size:var(--text-sm);">
          </div>`;
      default:
        return '';
    }
  }).join('');

  const faqHTML = (tool.faq || []).map(([q, a]) => `
      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          ${q}
          <span class="faq-chevron" aria-hidden="true">▾</span>
        </button>
        <div class="faq-answer">
          <p>${a}</p>
        </div>
      </div>`).join('');

  const featuresHTML = (tool.features || []).map(f => `<li>${f}</li>`).join('');

  const catClassMap = {
    'image-editing': 'cat-image', 'cropping-resizing': 'cat-crop', 'rotation-transform': 'cat-rotate',
    'text-tools': 'cat-text', 'conversion-compression': 'cat-convert', 'color-tools': 'cat-color',
    'design-creative': 'cat-design', 'utility-misc': 'cat-utility'
  };
  const catClass = catClassMap[tool.cat] || 'cat-utility';

  const isTextTool = ['text-tools'].includes(tool.cat);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tool.name} — Free Online Tool | EditPro Hub</title>
  <meta name="description" content="${tool.desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${tool.name} — EditPro Hub">
  <meta property="og:description" content="${tool.desc}">
  <meta property="og:url" content="${pageUrl}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${tool.name} — EditPro Hub">
  <meta name="twitter:description" content="${tool.desc}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/tool.css">
</head>
<body>
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar-inner">
      <a href="/" class="navbar-logo" aria-label="EditPro Hub Home">
        <span class="logo-icon" aria-hidden="true">⚡</span>
        <span>EditPro Hub</span>
      </a>
      <div class="navbar-nav">
        <div class="nav-dropdown">
          <button aria-expanded="false" aria-haspopup="true">Categories ▾</button>
          <div class="nav-dropdown-menu" id="nav-categories"></div>
        </div>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
      </div>
      <div class="navbar-actions">
        <button class="theme-toggle" aria-label="Toggle dark mode">🌙</button>
        <button class="mobile-menu-btn" aria-label="Open menu" aria-expanded="false">☰</button>
      </div>
    </div>
  </nav>

  <main class="tool-page">
    <div class="tool-header">
      <div class="breadcrumb">
        <a href="/">Home</a> <span aria-hidden="true">/</span>
        <a href="/#cat-${tool.cat}">${tool.catName}</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${tool.name}</span>
      </div>
      <h1>${tool.icon} ${tool.name}</h1>
      <p class="tool-tagline">${tool.desc}</p>
    </div>

    <!-- AdSense ad unit slot -->
    <div class="ad-slot" style="min-height:90px;margin:0 var(--container-padding) var(--space-6);">Advertisement</div>

    <div class="tool-container">
      <!-- Upload Zone -->
      <div class="upload-zone" id="upload-zone">
        <div class="upload-icon" aria-hidden="true">📤</div>
        <h3>Drop your image here or click to upload</h3>
        <p>Supports PNG, JPG, WEBP, GIF, BMP, SVG</p>
        <span class="file-types">Max file size: 50MB</span>
        <input type="file" accept="image/*" aria-label="Upload image file">
      </div>

      <!-- Tool Workspace -->
      <div class="tool-workspace" id="tool-workspace">
        <div class="preview-area" id="preview-area">
          <canvas id="preview-canvas"></canvas>
          <div class="tool-loading" id="tool-loading" style="display:none;"><div class="spinner"></div></div>
        </div>

        <div class="controls-panel">
          <h3>⚙️ Controls</h3>
          ${controlsHTML}
          <div class="tool-actions">
            <button class="btn btn-primary" id="download-btn">⬇ Download</button>
            <button class="btn btn-secondary" id="reset-btn">↺ Reset</button>
          </div>
        </div>
      </div>

      ${!isTextTool ? `
      <!-- Paste Support Notice -->
      <div style="text-align:center;margin-top:var(--space-4);color:var(--text-muted);font-size:var(--text-sm);">
        💡 Tip: You can also paste an image from clipboard using <kbd style="padding:2px 6px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;font-size:12px;">Ctrl</kbd> + <kbd style="padding:2px 6px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;font-size:12px;">V</kbd>
      </div>` : ''}
    </div>

    <!-- AdSense ad unit slot -->
    <div class="ad-slot" style="min-height:250px;margin:var(--space-8) var(--container-padding);">Advertisement</div>

    <!-- Tool Info Section -->
    <div class="tool-info">
      <section>
        <h2>How to Use ${tool.name}</h2>
        <ol>
          <li><strong>Upload your image</strong> — Drag and drop your image into the upload area, or click to browse your files.</li>
          <li><strong>Adjust settings</strong> — Use the controls panel to modify your image. All changes preview in real time.</li>
          <li><strong>Download result</strong> — When you're happy with the result, click the Download button to save your edited image.</li>
        </ol>
        <p>${tool.desc} This tool processes everything in your browser — your files are never uploaded to any server, ensuring complete privacy and security.</p>
      </section>

      <section>
        <h2>Features</h2>
        <ul>${featuresHTML}</ul>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          ${faqHTML}
        </div>
      </section>

      <section>
        <h2>Why EditPro Hub?</h2>
        <p>EditPro Hub provides free, browser-based tools that run entirely on your device. No uploads, no accounts, no watermarks. Our ${tool.name} is part of a suite of 100+ editing tools designed for quick, professional results. Whether you're a designer, photographer, content creator, or casual user, our tools deliver instant results without the complexity of desktop software.</p>
      </section>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="navbar-logo" style="color:white;margin-bottom:var(--space-4);">
            <span class="logo-icon" aria-hidden="true">⚡</span><span>EditPro Hub</span>
          </a>
          <p>100+ free browser-based editing tools. Your files never leave your device.</p>
        </div>
        <div><h4>Tools</h4><div class="footer-links">
          <a href="/tools/image-editing/brightness.html">Image Editing</a>
          <a href="/tools/cropping-resizing/cropper.html">Cropping & Resizing</a>
          <a href="/tools/rotation-transform/rotator.html">Rotation & Transform</a>
          <a href="/tools/text-tools/word-counter.html">Text Tools</a>
        </div></div>
        <div><h4>More Tools</h4><div class="footer-links">
          <a href="/tools/conversion-compression/format-converter.html">Conversion</a>
          <a href="/tools/color-tools/color-converter.html">Color Tools</a>
          <a href="/tools/design-creative/qr-gen.html">Design Tools</a>
          <a href="/tools/utility-misc/exif-viewer.html">Utilities</a>
        </div></div>
        <div><h4>Company</h4><div class="footer-links">
          <a href="/about.html">About Us</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy-policy.html">Privacy Policy</a>
          <a href="/terms.html">Terms of Service</a>
          <a href="/disclaimer.html">Disclaimer</a>
        </div></div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 EditPro Hub. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <button class="back-to-top" aria-label="Back to top">↑</button>

  <div class="cookie-banner" role="dialog" aria-label="Cookie consent">
    <div class="cookie-inner">
      <p>🍪 We use cookies and third-party ads to keep EditPro Hub free. By using our site, you agree to our use of cookies as described in our <a href="/privacy-policy.html">Privacy Policy</a>.</p>
      <div class="cookie-actions">
        <button class="btn btn-primary btn-sm cookie-accept">Accept</button>
        <button class="btn btn-ghost btn-sm cookie-dismiss">Dismiss</button>
      </div>
    </div>
  </div>

  <script src="/assets/js/utils.js"></script>
  <script src="/assets/js/tools-registry.js"></script>
  <script src="/assets/js/main.js"></script>
  <script src="/assets/js/tools/${tool.jsFile}"></script>
</body>
</html>`;
}

// ── Generate All Pages ──
function generate() {
  let count = 0;

  ALL_TOOLS.forEach(tool => {
    const dir = path.join(BASE_DIR, 'tools', tool.cat);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${tool.id}.html`);
    const html = generateToolPage(tool);
    fs.writeFileSync(filePath, html, 'utf8');
    count++;
    console.log(`✓ Generated: tools/${tool.cat}/${tool.id}.html`);
  });

  console.log(`\n✅ Generated ${count} tool pages successfully!`);
  return count;
}

generate();
