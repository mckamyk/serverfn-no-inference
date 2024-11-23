import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { useQuery } from 'node_modules/@tanstack/react-query/build/modern/useQuery.cjs'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

type Person = {
  name: string
}

export const greet = createServerFn({ method: 'GET' })
  .validator((person: unknown): Person => {
    if (typeof person !== 'object' || person === null) {
      throw new Error('Person must be an object')
    }

    if ('name' in person && typeof person.name !== 'string') {
      throw new Error('Person.name must be a string')
    }

    return person as Person
  })
  .handler(
    async ({
      data, // Person
    }) => {
      return `Hello, ${data.name}!`
    },
  )

function test() {
  greet({ data: { name: 'John' } }) // OK
  greet({ data: { name: 123 } }) // Error: Argument of type '{ name: number; }' is not assignable to parameter of type 'Person'.
}

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data } = useQuery({
    queryKey: ['test', 1],
    queryFn: () => {
      // None of the methods described in the docs
      // work to get type safety on the inputs of
      // the server functions.

      // I have the @ts-expect-error here combined with
      // calling the server functions with invalid input data
      // to show that the types are not working.

      // @ts-expect-error
      const r3 = greet({ data: { bad: 42 } }) // incorrect input data

      return ''
    },
  })

  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
    </div>
  )
}
