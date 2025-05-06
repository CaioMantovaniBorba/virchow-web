import { useState } from 'react';
import { Button } from "@/components/ui/button";


function RandomPage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Random Page</h1>
      <div className="card">
        <Button variant='default' className='w-32 mt-4' onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
      </div>
    </>
  )
}

export default RandomPage;
