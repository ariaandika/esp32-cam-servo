<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let watchID: number;
  let promise = $state(new Promise<GeolocationCoordinates>(()=>{}));


  onMount(() => {
    watchID = navigator.geolocation.watchPosition(
      (ok) => {
        console.log("Ok",ok.coords)
        const coords = ok.coords;
        promise = Promise.resolve(coords);
      },
      (err) => {
        promise = Promise.reject(new Error(err.message))
      },{
        enableHighAccuracy: true,
      }
    );
  })

  onDestroy(() => {
    if (watchID) {
      navigator.geolocation.clearWatch(watchID);
    }
  })

</script>

{#await promise}
  <div>loading...</div>
{:then coords}
  <div>{JSON.stringify(coords.toJSON())}</div>
{:catch error}
  <div class="text-red-600">
    GeolocationError, {"message" in error ? error.message : error}
  </div>
{/await}

