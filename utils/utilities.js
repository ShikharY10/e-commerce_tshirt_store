const FindIndex = (array, target) => {
    for (var i = 0; i < array.length; i++) {
        console.log({"public_id": array[i].id, "target": target})
        if (array[i].id === target) {
            return i;
        }
    }
    return -1;
}

module.exports = FindIndex;