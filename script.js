window.onload = () => {
  const map = L.map('map').setView([-1.5785, 101.3123], 12);

  const esri = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '© Esri & contributors'
    }
  ).addTo(map);

  const geeTileUrl = "https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/7e20cbfd7604b78aac9a323e05b86841-0729c88aea7bcc419d81215e2a984b3a/tiles/{z}/{x}/{y}";

  const geeLayer = L.tileLayer(geeTileUrl, {
    attribution: "Data: Google Earth Engine",
    opacity: 1.0
  }).addTo(map);

  L.control({ position: 'bottomright' }).onAdd = () => {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <strong>Legenda</strong><br>
      <i></i> Potensi Irigasi
    `;
    return div;
  }.addTo(map);
};
