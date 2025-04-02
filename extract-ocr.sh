#!/bin/bash

# This script will extract and display OCR text from the bill PDFs

TEMP_DIR="./temp"
PDF_DIR="./test-files"
OCR_API_KEY="${OCR_SPACE_API_KEY:-K86742198888957}"

# Create temp directory if it doesn't exist
mkdir -p "$TEMP_DIR"

echo "===== PROCESSING MARCH 2025 BILL ====="
# Extract page 3 from the March bill
pdftk "$PDF_DIR/2035custbill03122025.pdf" cat 3 output "$TEMP_DIR/march_page3.pdf"

# Use curl to send to OCR.space API
echo "Sending to OCR.space API..."
curl -H "apikey:$OCR_API_KEY" \
  -F "file=@$TEMP_DIR/march_page3.pdf" \
  -F "language=eng" \
  -F "isOverlayRequired=false" \
  -F "detectOrientation=false" \
  -F "scale=true" \
  -F "OCREngine=2" \
  "https://api.ocr.space/Parse/Image" > "$TEMP_DIR/march_ocr_result.json"

# Extract the ParsedText field from the JSON response
echo "\nMARCH BILL OCR TEXT:\n"
python3 -c "import json; print(json.load(open('$TEMP_DIR/march_ocr_result.json'))['ParsedResults'][0]['ParsedText'])"

echo "\n===== PROCESSING DECEMBER 2024 BILL ====="
# Extract page 3 from the December bill
pdftk "$PDF_DIR/2035custbill12112024.pdf" cat 3 output "$TEMP_DIR/december_page3.pdf"

# Use curl to send to OCR.space API
echo "Sending to OCR.space API..."
curl -H "apikey:$OCR_API_KEY" \
  -F "file=@$TEMP_DIR/december_page3.pdf" \
  -F "language=eng" \
  -F "isOverlayRequired=false" \
  -F "detectOrientation=false" \
  -F "scale=true" \
  -F "OCREngine=2" \
  "https://api.ocr.space/Parse/Image" > "$TEMP_DIR/december_ocr_result.json"

# Extract the ParsedText field from the JSON response
echo "\nDECEMBER BILL OCR TEXT:\n"
python3 -c "import json; print(json.load(open('$TEMP_DIR/december_ocr_result.json'))['ParsedResults'][0]['ParsedText'])"

# Clean up temporary files
rm -f "$TEMP_DIR/march_page3.pdf" "$TEMP_DIR/december_page3.pdf"
# Leave the JSON files for reference
