<script>
    let showPassword = false;
    let help = '';
    let success = '';

    let error = '';

    const MIN_CHARACTERS = 8;

    let zxcvbn;
    let zxcvbnLoading = false;

    function loadZxcvbn() {
        zxcvbnLoading = true;
        require(['/lib/static/js/zxcvbn/zxcvbn.js'], pkg => {
            zxcvbn = pkg;
        });
        return false;
    }

    $: passwordStrength = !zxcvbn
        ? !zxcvbnLoading && value.length > 4
            ? loadZxcvbn()
            : false
        : zxcvbn(value);
    $: passwordTooShort = value.length < MIN_CHARACTERS;

    $: pwdTooShortMsg = __('account / pwd-too-short').replace('%num', MIN_CHARACTERS);

    $: help =
        value === '' || !passwordStrength
            ? pwdTooShortMsg
            : __(
                  `account / password / ${
                      ['bad', 'weak', 'ok', 'good', 'excellent'][passwordStrength.score]
                  }`
              );
    $: error = !value
        ? false
        : passwordTooShort
        ? pwdTooShortMsg
        : passwordStrength && passwordStrength.score < 2
        ? help
        : false;
    $: success = passwordStrength && passwordStrength.score > 2 ? help : false;
    $: ok = value && !passwordTooShort;

    export let value = '';
    export let ok = '';
    export let __;
</script>

<div class="field mb-3">
    <label for="set-pwd" class="label">{__('password')}</label>

    <!-- input types can't be dynamic when using two-way value binding -->
    {#if showPassword}
        <input
            id="set-pwd"
            class="input"
            type="text"
            autocomplete="new-password"
            class:is-danger={error}
            class:is-success={!error && success}
            bind:value
        />
    {:else}
        <input
            id="set-pwd"
            class="input"
            type="password"
            autocomplete="new-password"
            class:is-danger={error}
            class:is-success={!error && success}
            bind:value
        />
    {/if}

    {#if error}
        <p class="help is-danger">{@html error}</p>
    {:else if success}
        <p class="help is-success is-dark">{@html success}</p>
    {:else if help}
        <p class="help has-text-grey-dark">{@html help}</p>
    {/if}
</div>

<div class="field">
    <label class="checkbox">
        <input bind:checked={showPassword} type="checkbox" />
        {@html __('account / invite / password-clear-text')}
    </label>
</div>
