export const getRotation = (a, b) => {
    const deltaX = a.x - b.x;
    const deltaY = a.y - b.y;
    return Math.atan2(-deltaX, deltaY);
};

export const getVelocity = rotation => {
    return {
        y: -Math.cos(rotation),
        x: Math.sin(rotation)
    }
};
