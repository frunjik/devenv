// safely handles circular references
export const safeStringify = (obj: any, indent = 2) => {
    const cache: string[] = [];
    const retVal = JSON.stringify(
        obj,
        (key, value) =>
            typeof value === "object" && value !== null
                ? cache.includes(value)
                    ? `**circular(${key}:${value})**`   // Duplicate reference found, replace with marker
                    : cache.push(value) && value        // Store value in our collection
                : value,
        indent
    );
    return retVal;
};
