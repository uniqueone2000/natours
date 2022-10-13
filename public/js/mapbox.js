// This function allows the following code to be 'bundled' by the 'Parcel' bundler package
export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoidW5pcXVlb25lMjAwMCIsImEiOiJjbDg4ODRqOGIxZXpnM3BwY21kaXpzeTVnIn0.6nfLN5N4WQE0DD12QwWzuw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/uniqueone2000/cl89j4bu4000m15m7v8q2w8o1',
  });

  map.scrollZoom.disable();

  const bounds = new mapboxgl.LngLatBounds();

  // This function creates the location elements for the map
  locations.forEach(loc => {
    // This variable creates a div and a class name for the 'Marker'
    const el = document.createElement('div');
    el.className = 'marker';

    // This adds a 'Marker' for each location
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates)
    .addTo(map);

    // This adds a 'Pop Op' dialog box for each 'Marker'
    new mapboxgl.Popup({
      offset: 30
    })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)    .addTo(map);

    // This extends the map boundaries to include the markers (at the tour locations)
    bounds.extend(loc.coordinates);
  });

  // This ensures that the map fits around the bounds
  map.fitBounds(bounds,{
    padding:  {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });

};
