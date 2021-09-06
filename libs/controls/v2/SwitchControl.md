# SwitchControl

A **switch** is used to enable or disbale a feature. It's similar to a [CheckboxControl], but they can "contain" other UI controls which are hidden if the SwitchControl is unchecked. If you only want to show additional options consider using [MoreOptionsGroup] instead of a switch.

Simple usage:

```html
<SwitchControl label="This is a toggle" bind:value="toggleValue">
    <p>This content will show up if the switch is turned on</p>
</SwitchControl>
```

You can disable the switch using the `disabled` property:

```html
<SwitchControl label="This is a toggle" bind:value="toggleValue" disabled="checkDisabled()"> </SwitchControl>
```

Sometimes it's useful to tell the user WHY a switch is disabled.
That's what the `disabledMessage` attribute is for:

```html
<SwitchControl label="This is a toggle" bind:value="toggleValue" disabled="checkDisabled()" disabledMessage="This is disabled because we say so">
</SwitchControl>
```

Also, when we are disabling a switch, sometimes we still internally
decide whether or not to interpret the disabled state as toggled
on or off. It might make sense to indicate this to the user by
forcing the switch state to "on" or "off" in case it is disabled.

```html
<SwitchControl label="This is a toggle" bind:value="toggleValue" disabled="checkDisabled()" disabledState="on"> </SwitchControl>
```

Switches can also be indeterminate.

```html
<SwitchControl label="This is a toggle" bind:value="toggleValue" indeterminate="1"> </SwitchControl>
```

Switches have integrated support for HelpDisplay balloons:

```html
<SwitchControl label="This is a toggle" bind:value="toggleValue" help="Here is some <b>help</b> that users see on hover"> </SwitchControl>
```

Switch states can be bound to the opposite of the value:

```html
<SwitchControl label="This is a toggle" bind:value="toggleValue" inverted> </SwitchControl>
```