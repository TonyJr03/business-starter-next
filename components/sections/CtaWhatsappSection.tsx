/**
 * CtaWhatsappSection — Server Component
 *
 * Sección de llamada a la acción con enlace directo a WhatsApp.
 */
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import type { WhatsappCtaSectionProps } from '@/types'

export function CtaWhatsappSection({
  title,
  subtitle,
  buttonLabel = 'Escribir por WhatsApp',
  message,
  bg = 'secondary',
  size = 'md',
}: WhatsappCtaSectionProps) {
  const url = getWhatsAppUrl(message)

  return (
    <Section bg={bg} size={size}>
      <div className="flex flex-col items-center text-center gap-6 max-w-xl mx-auto">

        {/* Ícono WhatsApp */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: '#25D366' }}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="w-7 h-7"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L.057 23.447a.75.75 0 0 0 .921.921l5.635-1.474A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 0 1-4.953-1.356l-.355-.213-3.684.964.981-3.597-.233-.371A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: 'var(--color-primary)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <Button
          href={url}
          variant="primary"
          size="md"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${buttonLabel} (abre WhatsApp en una nueva pestaña)`}
        >
          {buttonLabel}
        </Button>

      </div>
    </Section>
  )
}
