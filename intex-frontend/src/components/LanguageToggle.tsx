import { useTranslation } from 'react-i18next'
import { isPortugueseLanguage } from '../lib/locale'

export function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage ?? 'en'
  const isPortuguese = isPortugueseLanguage(currentLanguage)
  const nextLanguage = isPortuguese ? 'en' : 'pt'
  const label = isPortuguese ? t('language_switch_to_english') : t('language_switch_to_portuguese')

  return (
    <button
      type="button"
      onClick={() => void i18n.changeLanguage(nextLanguage)}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-brand-100 px-2.5 text-surface-text hover:bg-brand-100 hover:text-surface-dark"
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">🌐</span>
      <span className="text-xs font-semibold uppercase tracking-wide">
        {isPortuguese ? 'PT' : 'EN'}
      </span>
    </button>
  )
}

