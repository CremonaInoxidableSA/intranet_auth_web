import Link from "next/link"
import { SiAutodesk } from "react-icons/si"
import { IoIosCloudDone } from "react-icons/io"
import { MdOutlineFactory } from "react-icons/md"

const sistemas = [
  {
    titulo: "Control de Software Aprobado",
    url: "http://192.168.20.198:3100",
    Icon: IoIosCloudDone,
  },
  {
    titulo: "Control AutoDesk",
    url: "http://192.168.20.198:3101",
    Icon: SiAutodesk,
  },
  {
    titulo: "Produccion",
    url: "http://192.168.20.198:3200",
    Icon: MdOutlineFactory,
  },
]

export default function Page() {
  const midIndex = Math.ceil(sistemas.length / 2)
  const firstRow = sistemas.slice(0, midIndex)
  const secondRow = sistemas.slice(midIndex)

  const renderRow = (items: typeof sistemas) => (
    <div className="flex w-full flex-wrap items-center justify-center gap-5">
      {items.map((sistema) => {
        const Icon = sistema.Icon
        return (
          <Link
            key={sistema.url}
            href={sistema.url}
            className="flex h-[15vw] max-h-55 min-h-35 w-[15vw] max-w-55 min-w-35 flex-col items-center justify-center gap-3 rounded border-none bg-background2 p-4 font-semibold text-[#5d5d5d] transition-colors duration-200 ease-in-out hover:text-[#e82a31]"
          >
            <Icon className="flex h-full w-full items-center justify-center text-[#5d5d5d]" />
            <span className="text-sm">{sistema.titulo}</span>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="flex w-full flex-col items-center gap-5 p-5 text-center font-medium">
      <p className="max-w-3xl text-base leading-7">
        Hola, bienvenido a la Sistema General de Cremona Inoxidable S.A. Desde acá
        podés acceder a los siguientes sistemas:
      </p>
      {renderRow(firstRow)}
      {secondRow.length > 0 && renderRow(secondRow)}
    </div>
  )
}
