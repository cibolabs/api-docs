# AFM & Pasture Key Demonstration App

This application demonstrates how to integrate CiboLabs' **Agricultural Feedbase Monitor (AFM)** and **Pasture Key** services into a web mapping application.

It provides a unified interface to view national-scale biomass data (AFM) and high-resolution farm-scale data (Pasture Key), complete with time-series analysis tools.

## Features

### 🌍 Interactive Mapping
- **Base Map**: Google Hybrid (Satellite + Labels) for clear context.
- **Layer Control**: Toggle between different data products.
  - **AFM (National)**: TSDM (Total Standing Dry Matter), NBAR (Reflectance), Fractional Cover.
  - **Pasture Key (Farm)**: TSDM, NBAR, Fractional Cover, plus 30-day Composites.
- **Scalebar**: Metric scale reference.
- **Coordinate Inspector**: Real-time display of Latitude, Longitude, Zoom Level, Tile Coordinates (X, Y), and current Image Date.

### 📅 Time Travel
- **Date Slider**: Browse through the full history of satellite imagery.
- **Synchronized Updates**: The map layers and info boxes update in real-time as you slide through dates.
- **Context Aware**: The available dates automatically switch between National (AFM) and Farm (Pasture Key) datasets depending on your active layer.

### 🔍 Search & Inspect
- **Farm Loader**: Enter a specific **Property ID** (UUID) to zoom to a farm and load its private Pasture Key data.
- **Location Search**: Search for any address or place name to zoom the map.
- **Tile Inspection Popup**: Click anywhere on the map to view:
  - The specific satellite tile image.
  - Tile coordinates (Z, X, Y).
  - The direct API URL for the tile.
  - **Time Series Chart**: An interactive graph showing the history of pasture biomass (TSDM) for that specific location.
    - **AFM Context**: Shows statistics for the clicked tile's area (last 1 year).
    - **Farm Context**: Identifies the specific **paddock** you clicked and displays its full historical statistics (Mean and Median).

### 🛡️ Security & Architecture
- **Backend Proxy**: A Python Flask server handles all authentication with CiboLabs APIs.
  - Your **Client Secret** is stored securely on the server (`.env` file) and never exposed to the browser.
  - Acts as a proxy for API calls and Tile requests to eliminate **CORS** (Cross-Origin Resource Sharing) issues.
- **Robustness**: Handles data loading errors gracefully and ensures smooth switching between datasets.

---

## Getting Started

### Prerequisites
- **Python 3.8+** installed on your system.
- **CiboLabs API Credentials**: You need a `CIBO_CLIENT_ID` and `CIBO_CLIENT_SECRET`.

### Installation

1.  **Navigate to the project directory**:
    ```bash
    cd afm_demo
    ```

2.  **Install Python dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Credentials**:
    - The project includes a `.env` file for configuration.
    - Open `.env` and verify/update your credentials:
      ```ini
      CIBO_CLIENT_ID=your_client_id_here
      CIBO_CLIENT_SECRET=your_client_secret_here
      ```

### Running the Application

1.  **Start the Server**:
    ```bash
    python3 app.py
    ```
    You should see output indicating the server is running on `http://127.0.0.1:8000`.

2.  **Open the Application**:
    Open your web browser and navigate to:
    [http://localhost:8000](http://localhost:8000)

---

## How to Use

1.  **Explore National Data**:
    - The map loads with AFM TSDM (Biomass) data by default.
    - Use the **Slider** (bottom-left) to change the date.
    - Use the **Layer Control** (top-right) to switch to NBAR or Fractional Cover.

2.  **Load a Farm**:
    - Enter a valid Property UUID in the "Farm UUID" box (top-left).
    - Example ID: `434b1601-200d-428c-9c6d-1446b05ecc3b`
    - Click **Load**.
    - The map will zoom to the farm boundaries.

3.  **View Farm Data**:
    - Open the **Layer Control** and select a layer under **"Pasture Key (Farm)"** (e.g., *TSDM (Farm)* or *TSDM Composite (Farm)*).
    - The Date Slider will automatically update to show dates available for this farm.

4.  **Analyze Data**:
    - **Click on a paddock** (or anywhere on the map).
    - A popup will appear showing the tile image and a **Time Series Chart**.
    - The chart visualizes the biomass trends (Mean vs Median) and the variability (10th-90th percentile range).

---

## Project Structure

- **`app.py`**: The Flask backend application.
  - `/token`: Generates access tokens.
  - `/dates`, `/stats`: Proxies for AFM data API.
  - `/pk/...`: Proxies for Pasture Key data API.
  - `/proxy/tiles/...`: Proxies for image tiles to handle auth and CORS.
- **`static/index.html`**: The main frontend entry point.
- **`static/app.js`**: The core application logic (Leaflet map, layer management, charting).
- **`static/js/`**: Contains Leaflet plugins (Slider, Grouped Layer Control, Custom Headers).
