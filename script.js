window.onload = () => {
  const map = L.map('map').setView([-1.5785, 101.3123], 12);

  // Basemap satelit
  const esri = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '© Esri & contributors'
    }
  ).addTo(map);

  // ✅ Tile Earth Engine (yang baru)
  const geeTileUrl = "https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/4838baadbaa52db95726394742dcf76e-51f9f88f4b2131d5c87ac0410a4b984a/tiles/{z}/{x}/{y}";

  const geeLayer = L.tileLayer(geeTileUrl, {
    attribution: "Data: Google Earth Engine",
    opacity: 1.0
  }).addTo(map);

  // Legenda
  L.control({ position: 'bottomright' }).onAdd = () => {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <strong>Legenda</strong><br>
      <i style="background:#0000ff;width:18px;height:18px;display:inline-block;margin-right:6px;"></i> Potensi Irigasi
    `;
    return div;
  }.addTo(map);
};
