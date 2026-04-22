<template>
  <div class="space-y-4">
    <div
      id="map"
      class="h-80 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 z-0"
    ></div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Latitud</label>
        <input
          :value="modelValue.lat?.toFixed(6) || '---'"
          readonly
          class="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm dark:text-white"
        />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Longitud</label>
        <input
          :value="modelValue.lng?.toFixed(6) || '---'"
          readonly
          class="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm dark:text-white"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, watch, ref } from 'vue';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  // Fix para iconos de Leaflet en entornos de build (Vite)
  import markerIcon from 'leaflet/dist/images/marker-icon.png';
  import markerShadow from 'leaflet/dist/images/marker-shadow.png';

  const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  L.Marker.prototype.options.icon = DefaultIcon;

  const props = defineProps<{
    modelValue: { lat: number | null; lng: number | null };
  }>();

  const emit = defineEmits(['update:modelValue']);

  let map: L.Map;
  let marker: L.Marker | null = null;

  onMounted(() => {
    // Centro por defecto (ej. Bolivia) o ubicación existente
    const initialLat = props.modelValue.lat || -16.5;
    const initialLng = props.modelValue.lng || -68.15;
    const initialZoom = props.modelValue.lat ? 16 : 13;

    map = L.map('map').setView([initialLat, initialLng], initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Si ya hay coordenadas, colocar marcador
    if (props.modelValue.lat && props.modelValue.lng) {
      placeMarker(props.modelValue.lat, props.modelValue.lng);
    }

    // Evento click para mover/colocar marcador
    map.on('click', (e: L.LeafletMouseEvent) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
    });
  });

  function placeMarker(lat: number, lng: number) {
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const position = marker!.getLatLng();
        emit('update:modelValue', { lat: position.lat, lng: position.lng });
      });
    }
    emit('update:modelValue', { lat, lng });
  }
</script>
