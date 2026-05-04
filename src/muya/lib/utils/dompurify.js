import DOMPurify from 'dompurify'

const sanitize = DOMPurify.sanitize.bind(DOMPurify)
const isValidAttribute = DOMPurify.isValidAttribute.bind(DOMPurify)

export { isValidAttribute }

export default sanitize
