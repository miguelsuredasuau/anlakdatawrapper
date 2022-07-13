import publish from './publish.mjs';

const migrations = [...publish];

export default function (metadata) {
    migrations.forEach(migrate => migrate(metadata));
}
