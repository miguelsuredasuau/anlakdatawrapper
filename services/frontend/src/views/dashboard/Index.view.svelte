<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './Index.svelte';

    export let stores;

    const viewComponents = new Map();

    import ActiveTeam from './sidebar/ActiveTeam.svelte';
    viewComponents.set('dashboard/sidebar/active-team', ActiveTeam);
    import EmailActivation from './sidebar/EmailActivation.svelte';
    viewComponents.set('dashboard/sidebar/email-activation', EmailActivation);
    import EmailSetup from './sidebar/EmailSetup.svelte';
    viewComponents.set('dashboard/sidebar/email-setup', EmailSetup);
    import PendingTeamInvites from './sidebar/PendingTeamInvites.svelte';
    viewComponents.set('dashboard/sidebar/pending-invites', PendingTeamInvites);
    import Changelog from './sidebar/Changelog.svelte';
    viewComponents.set('dashboard/sidebar/changelog', Changelog);

    // ROLLUP IMPORT VIEW COMPONENTS dashboard/Index.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
