// Internationalization Module
// Re-exports all i18n utilities

export * from './config'
export { default as getRequestConfig } from './request'

// Type for messages structure
import type enMessages from './messages/en.json'

export type Messages = typeof enMessages
export type MessageKeys = keyof Messages

// Helper to get nested translation keys
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

export type TranslationKey = NestedKeyOf<Messages>
