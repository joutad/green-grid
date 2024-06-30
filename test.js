let somestr = "Based on the provided image, here are some suggestions to make the street more people-friendly and sustainable: STARTLIST 1. **Add Dedicated Bicycle Lanes**: Implementing bike lanes will encourage cycling and make it safer for cyclists. 2. **Increase Greenery**: Plant more trees along the street to provide shade, improve air quality, and enhance the aesthetic appeal. 3. **Improve Public Transportation**: Add bus stops and ensure there are sidewalks leading to them to promote the use of public transit. ENDLIST"

somestr = somestr.split(/(STARTLIST.*ENDLIST)/)

let desc = somestr[0]
let listitems = somestr[1]
listitems = listitems.substr(10)
// console.log(listitems);

listitems = listitems.split(/(\d\. \*\*\D*)/)
console.log(listitems)

let newlist = [];
listitems.forEach(element => {
    if (element.length > 0) {
        newlist.push(element.trim());
    }
});

newlist[2] = newlist[2].substr(0, newlist[2].length - 7)
console.log(newlist.join("\n"));