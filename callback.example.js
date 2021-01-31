// const final = (callback) => {
//     return setTimeout(() => callback(count += 1), 3000)
// }


function main(count, callback) {
    console.log(`Current count: ${count}`);
    setTimeout(() => callback(count += 1), 1000);
}

console.log("start");
main(1, count => {
    console.log("First Callback");
    setTimeout(() => main(count, count => {
        console.log("Second Callback");

        setTimeout(() => main(count, count => {
            console.log("Third Callback");

            setTimeout(() => main(count, count => {
                console.log("Fourth Callback");

                setTimeout(() => main(count, count => {
                    console.log("Fifth Callback");
                    
                    setTimeout(() => main(count, count => {
                        console.log("Sixth Callback");

                        setTimeout(() => main(count, count => {
                            console.log("Seventh Callback");

                            console.log(`Current count: ${count}`);
                        }), 1000);

                    }), 1000);

                }), 1000);

            }), 1000);
            

        }), 1000);

    }), 1000);

});