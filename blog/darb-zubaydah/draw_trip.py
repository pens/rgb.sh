import os

import cartopy.crs as ccrs
import cartopy.feature as cfeature
from cartopy.io.img_tiles import OSM
from exiftool import ExifToolHelper
import matplotlib.pyplot as plt

def load_gps_path(file_path: str):
    coords = []

    et = ExifToolHelper()
    metadata = et.get_tags(file_path, ["File:FileName", "Composite:GPSLatitude", "Composite:GPSLongitude"])

    for f in metadata:
        name = f.get("File:FileName")
        lat = f.get("Composite:GPSLatitude")
        lon = f.get("Composite:GPSLongitude")
        if lat is not None and lon is not None:
            coords.append((name, lon, lat))

    coords.sort(key=lambda x: x[0])
    lons = [coord[1] for coord in coords]
    lats = [coord[2] for coord in coords]
    return (lons, lats)

def draw(path):
    fig = plt.figure()
    ax = fig.add_subplot(1, 1, 1, projection=ccrs.Mercator())
    ax.set_extent([30, 60, 15, 35])
    ax.axis('off')

    ax.add_wms('https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi', 'VIIRS_SNPP_CorrectedReflectance_TrueColor', {'time': '2021-11-18'})
    ax.add_feature(cfeature.BORDERS)
    ax.plot(path[0], path[1], color="red", linestyle="solid", linewidth=1, transform=ccrs.Geodetic())

    plt.savefig("map.jpg", bbox_inches='tight', pad_inches=0, dpi=300, pil_kwargs={'optimize': True, 'quality': 95})

if __name__ == "__main__":
    path = load_gps_path("images")
    draw(path)