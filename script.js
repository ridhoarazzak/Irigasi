window.onload = () => {
  const map = L.map('map').setView([-1.5785, 101.3123], 12);
  let geojsonLayer = null, geeTileLayer = null, warnaKelas = {};
  const warnaTile = "#4a90e2";

  // === ✅ BASEMAPS ===
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  });

  const opentopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap'
  });

  const esri = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri' }
  );

  // Tambahkan OSM sebagai default
  osm.addTo(map);

  // === ✅ TILE EARTH ENGINE ===
  geeTileLayer = L.tileLayer(
    "https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/7150cf77fd5b7d4b47d78def9f563ed1-3206baa4cda700486aff3dd05a3aa9ba/tiles/{z}/{x}/{y}",
    { attribution: "Google Earth Engine", opacity: 0.6 }
  ).addTo(map);

  // === ✅ LAYER CONTROL ===
  const baseMaps = {
    "OpenStreetMap": osm,
    "OpenTopoMap": opentopo,
    "Esri Satelit": esri
  };

  const overlayMaps = {
    "Potensi Irigasi (Tile GEE)": geeTileLayer
  };

  L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: false }).addTo(map);

  // === ✅ LOAD GEOJSON ===
  fetch("https://raw.githubusercontent.com/ridhoarazzak/Irigasi/main/potensi_irigasi_filtered.geojson")
    .then(r => r.json())
    .then(data => {
      let dataKelas = {};
      const kelasUnik = [...new Set(data.features.map(f => f.properties.potensial))];
      const palet = ['#1a9850','#d73027','#91bfdb','#fee08b','#fc8d59','#66bd63'];
      kelasUnik.forEach((k,i)=> warnaKelas[k]=palet[i%palet.length]);

      geojsonLayer = L.geoJSON(data, {
        style: f => {
          const k = f.properties.potensial;
          return { color:"#000", fillColor: warnaKelas[k]||"#ccc", weight:1.2, fillOpacity:0.5 };
        },
        onEachFeature: (feature, layer) => {
          const k = feature.properties.potensial;
          let luas = turf.area(feature)/10000;
          dataKelas[k] = (dataKelas[k]||0) + luas;
          layer.bindPopup(`<b style="color:${warnaKelas[k]}">${k}</b><br>Luas: ${luas.toFixed(2)} ha`);
        }
      }).addTo(map);

      map.fitBounds(geojsonLayer.getBounds());
      buatChart(dataKelas);
      tambahLegend(dataKelas);
      window.downloadCSV = () => exportCSV(dataKelas);
    });

  // === ✅ CHART ===
  function buatChart(data) {
    const labels = Object.keys(data),
          values = labels.map(k=>data[k]),
          colors = labels.map(k=>warnaKelas[k]);

    new Chart(document.getElementById('chart').getContext('2d'), {
      type:'bar',
      data:{ labels, datasets:[{ label:'Luas (ha)', data:values, backgroundColor:colors }]},
      options:{ responsive:true, plugins:{ legend:{display:false}, title:{display:true, text:'Luas Potensi Irigasi'} }}
    });
  }

  // === ✅ CSV EXPORT ===
  function exportCSV(data) {
    const rows=[["Kategori","Luas (ha)"]];
    for(const k in data){
      if(k && !isNaN(data[k])) rows.push([k, data[k].toFixed(2)]);
    }
    if(rows.length<=1){alert("Data kosong");return;}
    const blob=new Blob([Papa.unparse(rows)],{type:'text/csv'});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="potensi_irigasi.csv"; document.body.appendChild(a); a.click(); a.remove();
  }

  // === ✅ LEGEND ===
  function tambahLegend(dataKelas) {
    L.control({position:'bottomright'}).onAdd = () => {
      const div=L.DomUtil.create('div','legend');
      div.innerHTML = `<strong>Legenda</strong><br>
        <i style="background:${warnaTile}"></i> Tile Potensial Irigasi<br>`;
      for(const k in dataKelas){
        div.innerHTML += `<i style="background:${warnaKelas[k]}"></i> ${k}<br>`;
      }
      return div;
    }.addTo(map);
  }

  // === ✅ TOGGLE LAYER MANUAL (masih bisa pakai tombol) ===
  window.toggleLayer = name => {
    const btn = name==='geojson'? 'toggleGeojson' : 'toggleTile';
    const layer = name==='geojson'? geojsonLayer : geeTileLayer;
    const el = document.getElementById(btn);
    if(map.hasLayer(layer)){
      map.removeLayer(layer);
      el.textContent = `Tampilkan ${name==='geojson'?'GeoJSON':'Tile GEE'}`;
    } else {
      map.addLayer(layer);
      el.textContent = `Matikan ${name==='geojson'?'GeoJSON':'Tile GEE'}`;
    }
  };
};
