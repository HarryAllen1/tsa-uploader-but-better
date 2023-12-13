<script lang="ts">
	import { auth, firestore, storage } from './firebase';
	import { FirebaseApp, SignedIn, userStore } from 'sveltefire';

	const user = userStore(auth);

	let count = $state(0);
</script>

<FirebaseApp {auth} {firestore} {storage}>
	<SignedIn></SignedIn>
</FirebaseApp>
