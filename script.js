mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpdHlhODkyMyIsImEiOiJjbTFqbDkzMmwwNm9hMmtvbWJxNWNhYWduIn0.UJgHX1BfpgFF6i62mxhfeg';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 11,
    center: [-122.335, 47.617]
});

map.addControl(new mapboxgl.NavigationControl());

async function geojsonFetch() {
    let response = await fetch('assets/bridges.geojson');
    let bridges = await response.json();

    response = await fetch('assets/Seattle.geojson');
    let seattle = await response.json();

    var table = document.getElementsByTagName("table")[0];
    for (let i = 0; i < bridges.features.length; i++) {
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = bridges.features[i].properties.name;
        cell2.innerHTML = bridges.features[i].properties.length_ft;
    }

    map.on('load', () => {
        map.addSource('bridges', {
            type: 'geojson',
            data: bridges
        });
        map.addLayer({
            'id': 'bridges-layer',
            'type': 'circle',
            'source': 'bridges',
            'paint': {
                'circle-radius': ['max', ['/', ['get', 'length_ft'], 50], 4],
                'circle-color': 'purple',
                'circle-opacity': 0.6,
                'circle-stroke-width': 1,
                'circle-stroke-color': 'black'
            }
        });
        map.addLayer({
            'id': 'bridge-centers',
            'type': 'circle',
            'source': 'bridges',
            'paint': {
                'circle-radius': 3,
                'circle-color': 'white'
            }
        });

        map.addSource('seattle', {
            type: 'geojson',
            data: seattle
        });
        map.addLayer({
            'id': 'seattle-layer',
            'type': 'fill',
            'source': 'seattle',
            'paint': {
                'fill-color': 'grey',
                'fill-opacity': 0.3
            }
        });
    
        map.on('click', 'bridges-layer', (e) => {
            const properties = e.features[0].properties;
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<strong>${properties.name}</strong><br>Length: ${properties.length_ft} ft`)
                .addTo(map);
        });

        map.on('mouseenter', 'bridges-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'bridges-layer', () => {
            map.getCanvas().style.cursor = '';
        });
    });
}

geojsonFetch().catch(e => console.log('Error loading GeoJSON: ' + e.message));

function sortTable() {
    let table = document.getElementsByTagName("table")[0];
    let switching = true;

    while (switching) {
        switching = false;
        let rows = table.rows;

        for (let i = 1; i < (rows.length - 1); i++) {
            let x = parseFloat(rows[i].getElementsByTagName("td")[1].innerHTML);
            
            let y = parseFloat(rows[i + 1].getElementsByTagName("td")[1].innerHTML);

            if (x < y) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                break;
            }
        }
    }
}
