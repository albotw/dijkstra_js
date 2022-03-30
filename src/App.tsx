import './App.css';
import {createNode, KDTree} from "./KDTree";

function App() {
  let tree : KDTree = new KDTree();
  tree.insert( createNode(0.7, 0.2));
  tree.insert( createNode(0.5, 0.4));
  tree.insert( createNode(0.2, 0.3));
  tree.insert( createNode(0.2, 0.4));
  tree.insert( createNode(0.4, 0.7));
  tree.insert( createNode(0.9, 0.6));

  console.log(tree.root);
  let target = createNode(0.2, 0.3);
  console.log("searching for 2, 3");
  let neighbour = tree.nearestNeighbour(target);
  console.log(neighbour.coords);

  return (
    <div className="App">

    </div>
  );
}

export default App;
