#==============================================================================
# Uses: UUID with namespace.
# Date: 2020-03-17
#==============================================================================
import uuid

class UUID_Namespace :
  # UUID version 5 namespace.
  uuidNamespace = uuid.uuid5( uuid.NAMESPACE_URL, "https://webhmi.drque.net/" )

  def getId( name ) :
    return str( uuid.uuid5( UUID_Namespace.uuidNamespace, name ) )