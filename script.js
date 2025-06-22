window.onload = () => {
  const map = L.map('map').setView([-1.5785, 101.3123], 12);

  let geojsonLayer = null;
  let geeTileLayer = null;

  // 🌍 Basemap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // 🟩 Tile dari Earth Engine
  geeTileLayer = L.tileLayer("https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/7150cf77fd5b7d4b47d78def9f563ed1-55e12cd78487575fbe4c1d6f876a398c/tiles/{z}/{x}/{y}", {
    attribution: "Google Earth Engine",
    opacity: 0.6
  }).addTo(map);

  // 🎨 Warna tiap kelas
  const warnaKelas = {
    "Potensial": "#1a9850",
    "Tidak Potensial": "#d73027"
  };

  const geojsonURL = "https://raw.githubusercontent.com/ridhoarazzak/Irigasi/main/potensi_irigasi_filtered.geojson";

  fetch(geojsonURL)
    .then(res => res.json())
    .then(data => {
      let dataKelas = {};

      geojsonLayer = L.geoJSON(data, {
        style: f => {
          const k = f.properties.Kelas || "Lainnya";
          return {
            color: warnaKelas[k] || "#888",
            fillColor: warnaKelas[k] || "#888",
            weight: 1,
            fillOpacity: 0.4
          };
        },
        onEachFeature: (feature, layer) => {
          const k = feature.properties.Kelas || "Lainnya";
          const luas = feature.properties["Luas (ha)"] || 0;
          dataKelas[k] = (dataKelas[k] || 0) + luas;
          layer.bindPopup(`<b style="color:${warnaKelas[k] || "#000"}">${k}</b><br>Luas: ${luas.toFixed(2)} ha`);
        }
      }).addTo(map);

      map.fitBounds(geojsonLayer.getBounds());
      buatChart(dataKelas);
      tambahLegend();
      window.downloadCSV = () => exportCSV(dataKelas);
    });

  function buatChart(data) {
    const labels = Object.keys(data);
    const values = labels.map(k => data[k]);
    const colors = labels.map(k => warnaKelas[k] || "#888");

    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
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
          title: {
            display: true,
            text: 'Luas Potensi Irigasi (ha)'
          }
        }
      }
    });
  }

  function exportCSV(data) {
    const rows = [["Kelas", "Luas (ha)"]];
    for (const [k, v] of Object.entries(data)) {
      rows.push([k, v.toFixed(2)]);
    }
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "potensi_irigasi.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function tambahLegend() {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = "<strong>Legenda</strong><br>";
      for (const [k, warna] of Object.entries(warnaKelas)) {
        div.innerHTML += `<i style="background:${warna}"></i> ${k}<br>`;
      }
      return div;
    };
    legend.addTo(map);
  }

  window.toggleLayer = function (layerName) {
    if (layerName === "geojson") {
      if (map.hasLayer(geojsonLayer)) {
        map.removeLayer(geojsonLayer);
      } else {
        map.addLayer(geojsonLayer);
      }
    } else if (layerName === "tile") {
      if (map.hasLayer(geeTileLayer)) {
        map.removeLayer(geeTileLayer);
      } else {
        map.addLayer(geeTileLayer);
      }
    }
  };
};
