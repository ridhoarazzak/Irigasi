window.onload = () => {
  const map = L.map('map').setView([-1.5785, 101.3123], 12);

  // Basemap
  const esri = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '© Esri' }
  ).addTo(map);

  // Tile GEE (dari URL terbaru dan publik)
  const geeTileUrl = "https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/7e20cbfd7604b78aac9a323e05b86841-f3d5ed50aef7df008eab6d7b99bebfde/tiles/{z}/{x}/{y}";

  const geeLayer = L.tileLayer(geeTileUrl, {
    attribution: "Google Earth Engine",
    opacity: 0.5
  }).addTo(map);

  // Legenda
  L.control({ position: 'bottomright' }).onAdd = () => {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <strong>Legenda</strong><br>
      <i style="background:#0000ff"></i> Potensi Irigasi (GEE)
    `;
    return div;
  }.addTo(map);
};
