window.onload = () => {
  // Inisialisasi peta
  const map = L.map('map').setView([-1.5785, 101.3123], 12);

  // Basemap: citra satelit Esri
  const esri = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '© Esri & contributors'
    }
  ).addTo(map);

  // Tile dari Earth Engine
  const geeTileUrl = "https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/f7817adcbff8fe1ca9831d8844213532-1d36da76844ad7a1913da0a69992b318/tiles/{z}/{x}/{y}";

  const geeLayer = L.tileLayer(geeTileUrl, {
    attribution: "Data: Google Earth Engine",
    opacity: 1.0
  }).addTo(map);

  // Legenda
  L.control({ position: 'bottomright' }).onAdd = () => {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <strong>Legenda</strong><br>
      <i style="background:#0000ff"></i> Potensi Irigasi
    `;
    return div;
  }.addTo(map);
};
