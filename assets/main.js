
async function fetchData(url = '', data = {}) {

   const response = await fetch(url, {

      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'text/html, text/plain'
         //'Content-Type': 'application/graphql'
         //'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header

   })

   return response.text()
   //return response.json() // parses JSON response into native JavaScript objects

}

//function submitForm() {
   const array = new Uint32Array(10);
   self.crypto.getRandomValues(array);

   var sum = 0;
   for (const num of array) {
      sum += num;
   }

   document.cookie = 'rand=' + sum + '; Secure; SameSite=Strict';
   console.log(sum);

   fetchData('https://155.138.202.79/', { hello: 'okay', total: sum })
      .then((data) => {
         console.log(data); // JSON data parsed by `data.json()` call
   });
//}
