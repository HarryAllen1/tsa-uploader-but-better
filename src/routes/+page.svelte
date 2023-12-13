<script lang="ts">
	import {} from 'firebase/app';

	let count = $state(0);
</script>

<button onclick={() => count++}>{count}</button>
