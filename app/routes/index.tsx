import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { useQuery } from 'node_modules/@tanstack/react-query/build/modern/useQuery.cjs'
import { z } from 'zod'

const dataSchema = z.object({
  foo: z.literal('bar'),
})

type DataType = z.infer<typeof dataSchema>

const zodDirect = createServerFn()
  .validator(dataSchema)
  .handler(({ data }) => data.foo) // type inference is fine here

const zodVerbose = createServerFn()
  .validator((d: unknown) => dataSchema.parse(d))
  .handler(({ data }) => data.foo) // type inference is fine here

const manual = createServerFn()
  .validator((d: unknown) => {
    if (typeof d !== 'object' || d === null)
      throw new Error('data must be an object')

    if (!('foo' in d)) throw new Error('data must have a foo property')

    if (d.foo !== 'bar') throw new Error('data.foo must be "bar"')

    return d as DataType
  })
  .handler(({ data }) => data.foo) // type inference is fine here

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
      const r1 = zodDirect({ data: { bad: 42 } }) // incorrect input data

      // @ts-expect-error
      const r2 = zodVerbose({ data: { bad: 42 } }) // incorrect input data

      // @ts-expect-error
      const r3 = manual({ data: { bad: 42 } }) // incorrect input data

      return ''
    },
  })

  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
    </div>
  )
}
