import "./App.css";
import { InfinitePeople } from "./people/InfinitePeople";
import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { InfiniteSpecies } from "./species/InfiniteSpecies";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Infinite SWAPI</h1>
        {/* <InfinitePeople /> */}
        <InfiniteSpecies />
      </div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
