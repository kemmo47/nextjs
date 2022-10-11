import type { GetServerSideProps, NextPage } from 'next'
import Router, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
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

const Home: NextPage = ({ notes }: Notes) => {
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
        refreshData()
        if ( data.id ) {
          deleteNote(data.id)
        }
        setForm({ title: '', content: '', id: '' })
      })
    } catch (err) {
      console.log(err)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      fetch(`/api/note/${id}`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: 'DELETE'
      }).then(() => {
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
        <div className="mt-3">
          {notes.map((note, i) => {
            return [
              <div key={i} id={note.id} className="mt-2 border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold font-xl text-decoration"><p>{note.title}</p></div>
                  <div className="font-sm">{note.content}</div>
                </div>
                <div className="flex items-center">
                  <button
                    className="px-3 py-1 bg-blue-400 rounded-md transition-all hover:bg-blue-300"
                    onClick={() => setForm({
                      title: note.title,
                      content: note.content,
                      id: note.id
                    })}
                  >
                    Update
                  </button>
                  <button className="ml-2 px-3 py-1 bg-red-400 rounded-md transition-all hover:bg-red-300"
                    onClick={() => deleteNote(note.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ]
          })}
        </div>
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
