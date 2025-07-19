# Flux 1.1 Pro Ultra Image Generator

A web application for generating images using the Flux 1.1 Pro Ultra model from Replicate.

## Features

- Text-to-image generation using Flux 1.1 Pro Ultra
- Multiple aspect ratios support: 1:1, 3:4, 4:3, 16:9, 9:16
- Download generated images
- Modern, responsive UI

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your Replicate API token:
   ```
   REPLICATE_API_TOKEN=your_actual_replicate_token_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:3000`

## Usage

1. Enter a text prompt describing the image you want to generate
2. Select your desired aspect ratio
3. Click "Generate Image"
4. Wait for the image to be generated (this may take a moment)
5. Download the generated image if desired

## Model Information

This application uses the Flux 1.1 Pro Ultra model:
- Model ID: `black-forest-labs/flux-1.1-pro-ultra`
- Version: `4f4ecf27427f34c3a3d9b8e3c648e3c5c7f7fd2f509f1173cdd24c38b02b8354`

## API Token

Get your Replicate API token from: https://replicate.com/account/api-tokens
