window.onload = () => {
  const map = L.map('map').setView([-1.5785, 101.3123], 12);
  let geojsonLayer = null;
  let geeTileLayer = null;
  const warnaTile = "#4a90e2"; // Biru dari tile GEE
  let warnaKelas = {};

  // 🎯 Basemaps
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  });

  const esri = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri' }
  );

  // Tambahkan basemap default terlebih dahulu
  osm.addTo(map);

  // 🌍 Layer control
  const baseMaps = { "OpenStreetMap": osm, "Citra Satelit Esri": esri };
  L.control.layers(baseMaps, null, { collapsed: false, position: 'topright' }).addTo(map);

  // 🟦 Tambahkan tile GEE di atasnya
  geeTileLayer = L.tileLayer(
    "https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/7150cf77fd5b7d4b47d78def9f563ed1-55e12cd78487575fbe4c1d6f876a398c/tiles/{z}/{x}/{y}",
    { attribution: "Google Earth Engine", opacity: 0.6 }
  ).addTo(map);

  geeTileLayer.bringToFront(); // Pastikan GEE tile di atas basemap

  // 🔽 Ambil dan tampilkan GeoJSON
  fetch("https://raw.githubusercontent.com/ridhoarazzak/Irigasi/main/potensi_irigasi_filtered.geojson")
    .then(r => r.json())
    .then(data => {
      let dataKelas = {};
      const kelasUnik = [...new Set(data.features.map(f => f.properties.potensial))];
      const palet = ['#1a9850', '#d73027', '#91bfdb', '#fee08b', '#fc8d59'];
      kelasUnik.forEach((k, i) => warnaKelas[k] = palet[i % palet.length]);

      geojsonLayer = L.geoJSON(data, {
        style: f => ({
          color: "#000",
          fillColor: warnaKelas[f.properties.potensial] || "#ccc",
          weight: 1.2,
          fillOpacity: 0.5
        }),
        onEachFeature: (feature, layer) => {
          const k = feature.properties.potensial;
          let luas = 0;
          try { luas = turf.area(feature) / 10000; } catch {}
          dataKelas[k] = (dataKelas[k] || 0) + luas;
          layer.bindPopup(`<b style="color:${warnaKelas[k]}">${k}</b><br>Luas: ${luas.toFixed(2)} ha`);
        }
      }).addTo(map);

      map.fitBounds(geojsonLayer.getBounds());
      buatChart(dataKelas);
      tambahLegend(dataKelas);
      window.downloadCSV = () => exportCSV(dataKelas);
    });

  function buatChart(data) {
    const labels = Object.keys(data);
    const values = labels.map(k => data[k]);
    const colors = labels.map(k => warnaKelas[k]);

    new Chart(document.getElementById('chart').getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Luas (ha)',
          data: values,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Luas Potensi Irigasi (ha)' }
        }
      }
    });
  }

  function exportCSV(data) {
    const rows = [["Kategori Potensial", "Luas (ha)"]];
    for (const [k, v] of Object.entries(data)) {
      if (k && !isNaN(v)) rows.push([k, v.toFixed(2)]);
    }
    if (rows.length <= 1) return alert("Data kosong.");
    const blob = new Blob([Papa.unparse(rows)], { type: 'text/csv' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "potensi_irigasi.csv";
    a.click();
  }

  function tambahLegend(dataKelas) {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `<strong>Legenda</strong><br>
        <i style="background:${warnaTile}"></i> Tile Potensial Irigasi<br>`;
      for (const k in dataKelas) {
        div.innerHTML += `<i style="background:${warnaKelas[k]}"></i> ${k}<br>`;
      }
      return div;
    };
    legend.addTo(map);
  }

  // 🔁 Toggle
  window.toggleLayer = name => {
    const btn = document.getElementById(name === "geojson" ? "toggleGeojson" : "toggleTile");
    const layer = name === "geojson" ? geojsonLayer : geeTileLayer;

    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      btn.textContent = `Tampilkan ${name === "geojson" ? "GeoJSON" : "Tile GEE"}`;
    } else {
      map.addLayer(layer);
      if (name === "tile") geeTileLayer.bringToFront(); // Selalu di atas basemap
      btn.textContent = `Matikan ${name === "geojson" ? "GeoJSON" : "Tile GEE"}`;
    }
  };
};
