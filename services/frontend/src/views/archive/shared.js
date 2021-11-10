export function getFolderUri(folder) {
    const parts = ['archive'];
    if (folder.teamId) {
        parts.push('team');
        parts.push(folder.teamId);
    }
    if (folder.id) parts.push(folder.id);
    return `/${parts.join('/')}`;
}

/*
 * builds a tree structure from a flat list of folders
 */
export function parseFolderTree(foldersMap, teamId = null) {
    const folders = Object.values(foldersMap).filter(f =>
        teamId ? f.teamId === teamId : !f.teamId
    );
    const folderMap = new Map();
    folders.forEach(folder => {
        folder.path = getFolderUri(folder);
        delete folder.children;
        folderMap.set(folder.id, folder);
    });
    folders.forEach(folder => {
        if (folder.id) {
            // not root folder
            const parent = folderMap.get(folder.parentId || null);
            // folder.parent = parent;
            if (!parent.children) {
                parent.children = [];
            }
            folder.getParent = () => parent;
            parent.children.push(folder);
        }
    });
    const root = folderMap.get(null);
    assignDepth(root, 0);
    return root;
}

function assignDepth(folder, depth = 0) {
    folder.level = depth;
    if (folder.children) {
        folder.children.forEach(child => assignDepth(child, depth + 1));
    }
}

export function byName(a, b) {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}
