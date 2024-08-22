<script setup>
  import { data } from '../../versions.data'
  const { version } = data
</script>

# Installation

The first step is to add the `@fuels/connectors` dependency to your project. You can do this using the following command:

::: code-group

```sh-vue [npm]
npm install @fuels/connectors@{{version}} --save
```

```sh-vue [pnpm]
pnpm add @fuels/connectors@{{version}}
```

```sh-vue [bun]
bun add @fuels/connectors@{{version}}
```

:::

**Note**: Use version `{{version}}` to ensure compatibility with `testnet` network—check the [docs](https://docs.fuel.network/guides/installation/#using-the-latest-toolchain).
