package imageutil

import (
	"bytes"
	"encoding/base64"
	"errors"
	"image"
	"image/jpeg"
	_ "image/png"
	"strings"

	"golang.org/x/image/draw"
)

// ResizeAndCompressBase64Image takes a base64 encoded image string (with or without data URI scheme),
// resizes it to fit within maxWidth and maxHeight while preserving aspect ratio,
// compresses it to JPEG, and returns the new base64 string with a JPEG data URI scheme.
func ResizeAndCompressBase64Image(base64Str string, maxWidth, maxHeight int) (string, error) {
	if base64Str == "" {
		return "", nil
	}

	// Extract the actual base64 data if it contains the data URI scheme prefix
	parts := strings.Split(base64Str, ",")
	var imgData string
	if len(parts) == 2 {
		imgData = parts[1]
	} else if len(parts) == 1 {
		imgData = parts[0]
	} else {
		return "", errors.New("invalid base64 image string")
	}

	// Decode the base64 string
	decoded, err := base64.StdEncoding.DecodeString(imgData)
	if err != nil {
		return "", err
	}

	// Decode the image
	img, _, err := image.Decode(bytes.NewReader(decoded))
	if err != nil {
		return "", err
	}

	// Calculate new dimensions while preserving aspect ratio
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	if width <= maxWidth && height <= maxHeight {
		// If the image is already smaller than the max dimensions, we can just return it as JPEG
		// Or we can just resize anyway to ensure compression
	}

	ratio := float64(width) / float64(height)
	newWidth := width
	newHeight := height

	if newWidth > maxWidth {
		newWidth = maxWidth
		newHeight = int(float64(newWidth) / ratio)
	}
	if newHeight > maxHeight {
		newHeight = maxHeight
		newWidth = int(float64(newHeight) * ratio)
	}

	// Create a new blank image with the new dimensions
	dst := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))

	// Resize using high-quality Catmull-Rom interpolation
	draw.CatmullRom.Scale(dst, dst.Bounds(), img, bounds, draw.Over, nil)

	// Encode to JPEG
	var buf bytes.Buffer
	err = jpeg.Encode(&buf, dst, &jpeg.Options{Quality: 75}) // Adjust quality as needed
	if err != nil {
		return "", err
	}

	// Convert back to base64 with JPEG data URI
	encoded := base64.StdEncoding.EncodeToString(buf.Bytes())
	return "data:image/jpeg;base64," + encoded, nil
}
