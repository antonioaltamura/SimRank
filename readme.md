# SimRank

A simple client-side JavaScript implementation and visualization of SimRank score.

![screenshot][s]

### Run instructions
- Install Node.js https://nodejs.org/en/
- copy the data you want to compute in `data.txt`
- run the server 
```
node server.js
```
- go to http://localhost:3000/

#### Note
The application works currently on bipartite graphs only.

Since the application comes with a visual representation of the graph and the scores are computed client-side, it cannot be used with huge graphs.


##### References
Jeh, Glen, and Jennifer Widom. "SimRank: a measure of structural-context similarity." _Proceedings of the eighth ACM SIGKDD international conference on Knowledge discovery and data mining_. ACM, 2002.
http://ilpubs.stanford.edu:8090/508/


[s]: https://raw.githubusercontent.com/antonioaltamura/SimRank/master/screenshot.png "Screenshot"
