# Web Annotation Tool

## Overview

A comprehensive web application for annotating text with POS (Part-of-Speech) tags and analyzing annotator agreement. This tool allows multiple annotators to label text and compare their annotations against standard datasets, providing insights into annotation consistency and quality.

## Features

- **Text Annotation**: Highlight and assign POS tags to text segments
- **Multi-Annotator Support**: Compare annotations from different contributors
- **Annotator Agreement Analysis**: Calculate and visualize consensus metrics between annotators
- **Standard Dataset Comparison**: Compare annotations against benchmark datasets
- **Visual Annotation Display**: Color-coded highlighting with intuitive label overlay
- **AWS S3 Integration**: Secure storage and retrieval of annotation data

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **UI Framework**: Tailwind CSS
- **Build Tool**: Vite
- **Cloud Storage**: AWS S3
- **Development Tools**: ESLint, TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- AWS account with S3 bucket access

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/web_annotation.git
   cd web_annotation/web_annotate
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the project root with the following variables:
   ```
   VITE_AWS_REGION=your-aws-region
   VITE_ACCESS_KEY_ID=your-access-key
   VITE_SECRET_ACCESS_KEY=your-secret-key
   VITE_S3_BUCKET=your-s3-bucket-name
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

### Annotating Text
1. Select a text from the available corpus
2. Highlight words or phrases to tag
3. Choose the appropriate POS tag from the label legend
4. Save annotations to the S3 bucket

### Comparing Annotations
1. Navigate to the comparison section
2. Select annotations from different annotators
3. View side-by-side comparison with color-coded highlights
4. Compare against standard test sets for accuracy measurement

### Analyzing Agreement
1. Select annotators to compare
2. Click "Calculate Agreement" to process data
3. View metrics including precision, recall, and F1 score
4. Identify areas of disagreement for further review

## POS Tag Set

The application uses the following POS tag set:

| Tag | Description | Color Code |
|-----|-------------|------------|
| N   | Danh từ     | #4CAF50   |
| Np  | Danh từ riêng | #2196F3 |
| Nc  | Danh từ chỉ loại | #FF9800 |
| Nu  | Danh từ đơn vị | #9C27B0 |
| V   | Động từ     | #E91E63   |
| A   | Tính từ     | #FFC107   |
| P   | Đại từ      | #3F51B5   |
| L   | Định từ     | #00BCD4   |
| M   | Số từ       | #795548   |
| R   | Trạng từ    | #FF4500   |
| E   | Giới từ     | #ADFF2F   |
| C   | Liên từ     | #7FFF00   |
| I   | Thán từ     | #00CED1   |
| T   | Trợ từ      | #FF69B4   |
| U   | Từ đơn tính | #6A5ACD   |
| Y   | Từ viết tắt | #00FA9A   |
| X   | Không phân loại | #8B0000 |

## Build for Production

```
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Tấn Lợi (Annotation Analysis)
- Phương Ngân (Annotator)
- Lê Ngọc (Annotator)
- Minh Ngọc (Annotator)

## Acknowledgments

- Test datasets provided by Vietnamese POS tagging research community
