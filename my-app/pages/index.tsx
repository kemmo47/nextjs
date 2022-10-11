import type { GetServerSideProps, NextPage } from 'next'
import Router, { useRouter } from 'next/router'
import { useState } from 'react'
import { prisma } from '../lib/prisma'

interface Notes {
  notes: {
    id: string
    title: string
    content: string
  }[]
}
interface FormData {
  title: string
  content: string
  id: string
}

const Home: NextPage = ({notes}: Notes) => {
  const [form, setForm] = useState<FormData>({ title: '', content: '', id: '' })
  const router = useRouter()

  const refreshData = () => {
    Router.replace(router.asPath)
  }

  const create = async (data: FormData) => {
    try {
      fetch('http://localhost:3000/api/create', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      }).then(() => {
        setForm({ title: '', content: '', id: '' })
        refreshData()
      })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="mt-10 px-10">
      <h1 className="text-center font-bold text-2xl mt-2">Notes</h1>
      <form onSubmit={e => {
        e.preventDefault()
        create(form)
      }} className="w-auto min-w-[25%] max-w-min mx-auto space-y-6 flex flex-col items-stretch">
        <input type="text"
          placeholder='Title'
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="border-2 rounded border-gray-600 p-1"
        />
        <textarea
          placeholder='Content'
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          className="border-2 rounded border-gray-600 p-1"
        ></textarea>

        <button
          type='submit'
          className="bg-blue-500 text-white rounded p-1"
        >
          Add +
        </button>
      </form>

      <div className='mt-5'>
        <ul className="mt-3">
          {notes.map((note, i) => {
            return [
              <li key={note.id} id={note.id} className="mt-3">
                {note.title}
              </li>
            ]
          })}
        </ul>
      </div>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  const notes = await prisma?.note.findMany({
    select: {
      title: true,
      id: true,
      content: true
    }
  })

  return {
    props: {
      notes
    }
  }
}
