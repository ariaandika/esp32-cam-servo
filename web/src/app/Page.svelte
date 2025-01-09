<script lang="ts">
import { WsController } from "./lib.svelte"
import { DoorClient, ImgClient, McuClient, RegisterClient } from "./controllers.svelte"
import { onDestroy, onMount, tick } from "svelte";
import { FaceApi } from "./face";

const ws = new WsController(DoorClient.ID,McuClient.ID,ImgClient.ID,"imgbin");

const faceapi = new FaceApi()

const door = new DoorClient(ws);
const mcu = new McuClient(ws);
const img = new ImgClient(ws, faceapi);

const register = new RegisterClient(faceapi)

let listRegisteredModal = $state(false);
let registeredImagesPromise = $state(new Promise<string[]>(() => {}));

// let registerModal = $state(false);

let attemptModal = $state(false);

onMount(() => {
  return ws.destroy.bind(ws);
})

onDestroy(() => {
  ws.destroy();
})

function registerdImagesAction(_: HTMLElement) {
  registeredImagesPromise = fetch(import.meta.env.VITE_SERVER_URL + "/pict/registered")
    .then(async e => await e.json()).then(e => e.images.map((e: any) => "/.tmp/" + e));
}

function backdrop(node: HTMLElement, cb: () => any) {
  node.addEventListener("click", function(e) {
    if (e.target == this) {
      cb();
    }
  })
}

</script>

{#if register.modal}
  <section
    use:backdrop={()=>register.modal = false}
    class="fixed top-0 left-0 w-screen h-screen grid place-items-center bg-black/20"
  >
    <section class="p-4 space-y-4 bg-white rounded-lg shadow-lg">
      <video width="800" height="600" use:RegisterClient.use={register}>
        <track kind="captions">
      </video>
      <section class="flex gap-4 justify-end">
        <div>{register.state}</div>
        {#await register.promise}
          <div>loading...</div>
        {:then}
          <button class="btn" onclick={() => register.capture()}>Capture</button>
        {:catch err}
          <div class="text-red-600">{err?.message ?? err}</div>
        {/await}
        <button class="btn" onclick={() => register.modal = false}>Tutup</button>
      </section>
    </section>
  </section>
{/if}

{#if listRegisteredModal}
  <section
    use:registerdImagesAction
    use:backdrop={()=>listRegisteredModal = false}
    class="fixed top-0 left-0 w-screen h-screen grid place-items-center bg-black/20"
  >
    <section class="max-h-[80vh] overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow-lg">
      {#await registeredImagesPromise}
        <div>Loading...</div>
      {:then images} 
        {#each images as image}
          <section class="relative">
            <img src={image} alt="">
            <button
              class="btn absolute bottom-4 right-4 bg-red-500 active:bg-red-400"
              onclick={() => (img.remove(image),listRegisteredModal = false,tick().then(() => listRegisteredModal = true))}
            >
              hapus
            </button>
          </section>
        {/each}
      {:catch err}
        <div>Error: {err?.message ?? err}</div>
      {/await}
      <section class="flex justify-end">
        <button class="btn" onclick={() => listRegisteredModal = false}>Tutup</button>
      </section>
    </section>
  </section>
{/if}

{#if attemptModal}
  <section
    use:backdrop={() => attemptModal = false}
    class="fixed top-0 left-0 w-screen h-screen grid place-items-center bg-black/20"
  >
    <section class="p-4 space-y-4 bg-white rounded-lg shadow-lg">
      <section use:ImgClient.image={img} class="flex gap-4">
      </section>
      <button class="btn" onclick={() => ws.publish({ id: "mcu", value: { kind: "capture" } })}>
      <div>{img.state}</div>
    </section>
  </section>
{/if}

<section>
  <section class="bg-indigo-500 shadow-lg">
    <h1 class="container mx-auto px-4 py-4 text-4xl text-white font-bold">Control Panel</h1>
  </section>

  <section class="container mx-auto px-4 mt-16 grid gap-4 lg:grid-cols-[2fr_1fr]">
    <section class="space-y-4">
      <section class="min-h-48 p-8 bg-white shadow-lg">
        <h2 class="section-title">Pengaturan</h2>
        <button class="btn" onclick={door.toggle.bind(door)}>
          Ubah Pintu
        </button>
        <button class="btn" onclick={mcu.flashtoggle.bind(mcu)}>
          Ubah Flash
        </button>
      </section>

      <section class="min-h-48 p-8 bg-white shadow-lg">
        <h2 class="section-title">Deteksi Wajah</h2>
        <button class="btn" onclick={() => listRegisteredModal = true}>
          Wajah Terdaftar
        </button>
        <button class="btn" onclick={() => register.modal = true}>
          Daftar
        </button>
      </section>

      <section class="min-h-48 p-8 bg-white shadow-lg">
        <h2 class="section-title">Debug</h2>
        <button class="btn" onclick={() => attemptModal = true}>
          Debug
        </button>
        <button class="btn" onclick={() => ws.publish({ id: "mcu", value: { kind: "capture" } })}>
          Capture
        </button>
      </section>
    </section>

    <section class="space-y-4">
      <section class="min-h-48 p-8 bg-white shadow-lg">
        <h2 class="section-title">Status</h2>
        {#await ws.promise}
          <div class="font-bold text-gray-700">menghubungkan...</div>
        {:then}
          <div class="flex justify-between font-bold">
            <div>Pintu</div>
            <div class="text-{door.state.open ? "green" : "red"}-600">
              {door.state.open ? "buka" : "tutup"}
            </div>
          </div>
          <div class="flex justify-between font-bold">
            <div>Flash Kamera</div>
            <div class="text-{mcu.state.flash ? "green" : "red"}-600">
              {mcu.state.flash ? "hidup" : "mati"}
            </div>
          </div>
        {:catch err}
          <div>Koneksi putus {err?.message ?? err}, menghubungkan kembali...</div>
        {/await}
      </section>

      <section class="min-h-48 p-8 bg-white shadow-lg">
        <h2 class="section-title">Koneksi</h2>
        {#await ws.promise}
          <div class="font-bold text-gray-700">menghubungkan...</div>
        {:then}
          <div class="flex justify-between font-bold">
            <div>WebSocket</div>
            <div class="text-green-600">ok</div>
          </div>
        {:catch err}
          <div>Koneksi putus {err?.message ?? err}, menghubungkan kembali...</div>
        {/await}
      </section>
    </section>

  </section>
</section>

