<script>
export default {
  data: () => ({
    title: "Golang FAQ",
    faq: [
      {
        question: "slice 和数组的区别 ? (基本必问)",
        answer: `array 是固定长度的数组，并且是值类型的，也就是说是拷贝复制的;\n
          slice 是一个引用类型，指向了一个动态数组的指针，会进行动态扩容.`,
        difficulty: "easy",
      },
      {
        question: "make 和 new 的区别 ? (基本必问)",
        answer: `new: 用于分配内存，返回一个指向一个新的内存地址且初始值为0的指针第一个参数为类型;\n
            make: 仅用于分配内存和初始化一个对象类型(slice, map, chan), 返回类型和它的第一个参数类型相同而不是一个指针，返回引用`,
        difficulty: "medium",
      },
      {
        question: "defer 的执行顺序 ? (基本必问)",
        answer: `defer执行顺序和调用顺序相反，类似于栈后进先出;\n
            多个defer语句最先被定义的defer语句最后执行;\n
            defer在return之后执行，但在函数退出之前，defer可以修改返回值`,
        difficulty: "medium",
      },
      {
        question: "Golang 是如何实现 Maps 的？",
        answer: `
        Go 语言内置了 map 数据结构, map 的底层便是一个 HashTable,
        map的源码位于 src/runtime/map.go中

        // Map contains Type fields specific to maps.
        type Map struct {
            Key  *Type // Key type
            Elem *Type // Val (elem) type

            Bucket *Type // internal struct type representing a hash bucket
            Hmap   *Type // internal struct type representing the Hmap (map header object)
            Hiter  *Type // internal struct type representing hash iterator state
        }

        前两个字段分别为 key value, 由于 go map 支持多种数据类型,
        go 会在编译期推断其具体的数据类型,
        Bucket 是哈希桶, Hmap 表征了 map 底层使用的 HashTable 的元信息, 如当前 HashTable 中含有的元素数据、桶指针等,
        Hiter 是用于遍历 go map 的数据结构
        map同样也是数组存储的的，每个数组下标处存储的是一个bucket,这个bucket的类型见下面代码，每个bucket中可以存储8个kv键值对，
        当每个bucket存储的kv对到达8个之后，会通过overflow指针指向一个新的bucket，从而形成一个链表

        map如何扩容:
            go map 的扩容类似于 redis, 都是采用渐进式扩容,
            避免一次性对大 map 扩容造成的区间性能抖动, go 扩容的基本步骤是首先根据扩容条件(装载因子 >= 6.5 或 溢出桶数目太多),
            而确定扩容后的大小, 然后创建该大小的新哈希桶, 这时会将 hmap 中的 buckets 指针指向新创建的哈希桶,
            而原先的哈希桶地址则保存在 oldbuckets 指针中

        map 的遍历：
            外层循环遍历所有 Bucket, 中层循环横向遍历所有溢出桶, 内层循环遍历 Bucket 的所有 k/v ,
            若没有扩容逻辑的话, 以上所述的 3 层循环即可完成 map 的遍历
            map 的遍历是无序的
        `,
        difficulty: "hard",
      },
      {
        question: "Maps 是线程安全的吗？怎么解决它的并发安全问题？",
        answer: `
        map不是线程安全的
        如何解决map并发安全问题：
            1. 加读写锁：读取的时候加读锁，写的时候加写锁。
            2. 使用线程安全的 sync.Map： 写值的时候得通过 Store 方法，读的时候使用方法 Load 来读取
                sync.Map 支持并发读写，采取了 “空间换时间” 的机制，冗余了两个数据结构，分别是：read 和 dirty。
                和我们的第一种方案 map+RWMutex 的实现并发的方式相比，减少了加锁对性能的影响。
                它做了一些优化：可以无锁访问read map，而且会优先操作read map，倘若只操作read map就可以满足要求，那就不用去操作write map(dirty)。
                所以在某些特定场景中它发生锁竞争的频率会远远小于 map+RWMutex 的实现方式
                适合读多写少的场景；
                缺点也就是：如果是写多的场景，会导致 read map 缓存失效，需要加锁，冲突变多，性能急剧下降。
        `,
        difficulty: "medium",
      },
      {
        question: "Go 如何实现原子操作？",
        answer: `
            CompareAndSwap(CAS)
            Swap(交换)
            Add(增加或减少)
            Load(原子读取)
            Store(原子写入)

            Go语言通过内置包sync/atomic提供了对原子操作的支持，其提供的原子操作有以下几大类：
            增减，操作的方法名方式为AddXXXType，保证对操作数进行原子的增减，支持的类型为int32、int64、uint32、uint64、uintptr，使用时以实际类型替换前面我说的XXXType就是对应的操作方法。
            载入，保证了读取到操作数前没有其他任务对它进行变更，操作方法的命名方式为LoadXXXType，支持的类型除了基础类型外还支持Pointer，也就是支持载入任何类型的指针。
            存储，有载入了就必然有存储操作，这类操作的方法名以Store开头，支持的类型跟载入操作支持的那些一样。
            比较并交换，也就是CAS （Compare And Swap），像Go的很多并发原语实现就是依赖的CAS操作，同样是支持上面列的那些类型。
            交换，这个简单粗暴一些，不比较直接交换，这个操作很少会用

            互斥锁跟原子操作的区别:
            使用目的：互斥锁是用来保护一段逻辑，原子操作用于对一个变量的更新保护。
            底层实现：Mutex由操作系统的调度器实现，而atomic包中的原子操作则由底层硬件指令直接提供支持，
                    这些指令在执行的过程中是不允许中断的，因此原子操作可以在lock-free的情况下保证并发安全，并且它的性能也能做到随CPU个数的增多而线性扩展。
            对于一个变量更新的保护，原子操作通常会更有效率，并且更能利用计算机多核的优势。
        `,
        difficulty: "hard",
      },
      {
        question: "有缓存的管道和没有缓存的管道区别是什么？",
        answer: `
            无缓冲的与有缓冲channel有着重大差别：一个是同步的 一个是非同步的
            对于无缓冲区channel：
            发送的数据如果没有被接收方接收，那么发送方阻塞；如果一直接收不到发送方的数据，接收方阻塞；
            有缓冲的channel：
            发送方在缓冲区满的时候阻塞，接收方不阻塞；接收方在缓冲区为空的时候阻塞，发送方不阻塞。

            -------
            1.缓冲区大小不同
            不带缓冲区的chan的缓冲区大小是0，带缓冲区的chan缓冲区至少是1.
            2.运行方式不同
            不带缓冲区的chan线程写入时会立马发生阻塞，直到有其他线程有对该chan执行接收操作且接收成功后，写入的进程才会解除阻塞。
            不带缓冲区的chan线程接收时也会立马发生阻塞，直到有其他线程对该chan执行写入操作后，接收的线程才会解除阻塞。
            带缓冲区的chan执行线程执行写入时
        `,
        difficulty: "easy",
      },
      {
        question: "channels 怎么保证线程安全？",
        answer: `
        并发安全的产生：
            在高并发场景下，进程、线程（协程）可能会发生资源竞争，导致数据脏读、脏写、死锁等问题，为了避免此类问题的发生，就有了并发安全。
        如何保证并发安全：
            Mutex：
                悲观锁是一种悲观思想，它总认为最坏的情况可能会出现。不管意料之外的结果是否会发生，只要存在发生的可能，就在操作这个资源之前先上锁
                互斥锁(sync.Mutex)、读写锁(Sync.RWMutex)都是悲观锁
                在go中，除了automic，其它都是悲观锁
                乐观锁的思想与悲观锁的思想相反，它总认为资源和数据不会被别人所修改，所以读取不会上锁，但是乐观锁在进行写入操作的时候会判断当前数据是否被修改过
                乐观锁的实现方案主要包含CAS和版本号机制。乐观锁适用于多读的场景，可以提高吞吐量
            Channel：
                不要通过共享内存来通信，而是通过通信来共享内存;
                channel内部维护了一个互斥锁，来保证线程安全
            Atomic

        channel是线程安全的吗:
            如果把线程安全定义为允许多个goroutine同时去读写，那么golang 的channel 是线程安全的。不需要在并发读写同一个channe时加锁
        `,
        difficulty: "hard",
      },
      {
        question: "context 使用场景和用途 ?",
        answer: `context简化对于处理单个请求的多个Goroutine协程之间与请求域的数据、超时和退出等操作，实现线程安全退出或超时的控制`,
        difficulty: "medium",
      },
      {
        question: "简单介绍 GMP 模型以及该模型的优点 ? (基本必问)",
        answer: `GMP 模型是 golang 自己的一个调度模型，它抽象出了下面三个结构：
            G： 也就是协程 goroutine，由 Go runtime 管理。我们可以认为它是用户级别的线程。
            P： processor 处理器。每当有 goroutine 要创建时，会被添加到 P 上的 goroutine 本地队列上，如果 P 的本地队列已满，则会维护到全局队列里。
            M： 系统线程。在 M 上有调度函数，它是真正的调度执行者，M 需要跟 P 绑定，并且会让 P 按下面的原则挑出个 goroutine 来执行：

            优先从 P 的本地队列获取 goroutine 来执行；如果本地队列没有，从全局队列获取，如果全局队列也没有，会从其他的 P 上偷取 goroutine。
        `,
        difficulty: "hard",
      },
      {
        question: "协程与进程，线程的区别是什么？协程有什么优势？",
        answer: `
        进程是资源分配的最小单位,
        多进程就是指计算机系统可以同时执行多个进程，从一个进程到另外一个进程的转换是由操作系统内核管理的，一般是同时运行多个软件
            进程间的信息难以共享数据，父子进程并未共享内存，需要通过进程间通信（IPC），在进程间进行信息交换，性能开销较大。
            创建进程（一般是调用 fork 方法）的性能开销较大
        进程由多个线程组成
        一个进程可以由多个称为线程的执行单元组成。每个线程都运行在进程的上下文中，共享着同样的代码和全局数据
        多线程比多进程之间更容易共享数据，在上下文切换中线程一般比进程更高效

        协程是什么:
            协程是用户态的线程。通常创建协程时，会从进程的堆中分配一段内存作为协程的栈。
            线程的栈有 8 MB，而协程栈的大小通常只有 KB，而 Go 语言的协程更夸张，只有 2-4KB，非常的轻巧。
            对于 进程、线程，都是有内核进行调度，有 CPU 时间片的概念，进行 抢占式调度
            对于 协程(用户级线程)，这是对内核透明的，也就是系统并不知道有协程的存在，是完全由用户自己的程序进行调度的，因为是由用户程序自己控制，
            那么就很难像抢占式调度那样做到强制的 CPU 控制权切换到其他进程/线程，通常只能进行 协作式调度，需要协程自己主动把控制权转让出去之后，其他协程才能被执行到
        协程的优势:
            节省 CPU：避免系统内核级的线程频繁切换，造成的 CPU 资源浪费。好钢用在刀刃上。而协程是用户态的线程，用户可以自行控制协程的创建于销毁，极大程度避免了系统级线程上下文切换造成的资源浪费。
            节约内存：在 64 位的Linux中，一个线程需要分配 8MB 栈内存和 64MB 堆内存，系统内存的制约导致我们无法开启更多线程实现高并发。而在协程编程模式下，可以轻松有十几万协程，这是线程无法比拟的。
            稳定性：前面提到线程之间通过内存来共享数据，这也导致了一个问题，任何一个线程出错时，进程中的所有线程都会跟着一起崩溃。
            开发效率：使用协程在开发程序之中，可以很方便的将一些耗时的IO操作异步化，例如写文件、耗时 IO 请求等。
            线程和 goroutine 切换调度开销方面
    　　　　线程/goroutine 切换开销方面，goroutine 远比线程小
    　　　　线程：涉及模式切换(从用户态切换到内核态)、16个寄存器、PC、SP...等寄存器的刷新等。
    　　　　goroutine：只有三个寄存器的值修改 - PC / SP / DX.
        协程本质上就是用户态下的线程，所以也有人说协程是 “轻线程”，但我们一定要区分用户态和内核态的区别，很关键。

        goroutine 和协程区别:
            本质上，goroutine 就是协程。 不同的是，Golang 在 runtime、系统调用等多方面对 goroutine 调度进行了封装和处理，当遇到长时间执行或者进行系统调用时，
            会主动把当前 goroutine 的CPU (P) 转让出去，让其他 goroutine 能被调度并执行，也就是 Golang 从语言层面支持了协程。
            Golang 的一大特色就是从语言层面原生支持协程，在函数或者方法前面加 go关键字就可创建一个协程

        `,
        difficulty: "medium",
      },
      {
        question: "简述 Golang 垃圾回收的机制 ? (基本必问)",
        answer: `Go1.3采用标记清除法， Go1.5采用三色标记法，Go1.8采用三色标记法+混合写屏障。
        标记清除法
            分为两个阶段：标记和清除
            标记阶段：从根对象出发寻找并标记所有存活的对象。
            清除阶段：遍历堆中的对象，回收未标记的对象，并加入空闲链表。
            缺点是需要暂停程序STW。
            三色标记法：
            将对象标记为白色，灰色或黑色。
            白色：不确定对象（默认色）；黑色：存活对象。灰色：存活对象，子对象待处理。
            标记开始时，先将所有对象加入白色集合（需要STW）。首先将根对象标记为灰色，然后将一个对象从灰色集合取出，
            遍历其子对象，放入灰色集合。同时将取出的对象放入黑色集合，直到灰色集合为空。最后的白色集合对象就是需要清理的对象。
            这种方法有一个缺陷，如果对象的引用被用户修改了，那么之前的标记就无效了。因此Go采用了写屏障技术，当对象新增或者更新会将其着色为灰色。
            一次完整的GC分为四个阶段：
            准备标记（需要STW），开启写屏障。
            开始标记
            标记结束（STW），关闭写屏障
            清理（并发）
            基于插入写屏障和删除写屏障在结束时需要STW来重新扫描栈，带来性能瓶颈。混合写屏障分为以下四步：
            GC开始时，将栈上的全部对象标记为黑色（不需要二次扫描，无需STW）；
            GC期间，任何栈上创建的新对象均为黑色
            被删除引用的对象标记为灰色
            被添加引用的对象标记为灰色
            总而言之就是确保黑色对象不能引用白色对象，这个改进直接使得GC时间从 2s降低到2us。

            -------------------
            Go 采用的是三色标记法，将内存里的对象分为了三种：
            白色对象：未被使用的对象；
            灰色对象：当前对象有引用对象，但是还没有对引用对象继续扫描过；
            黑色对象，对上面提到的灰色对象的引用对象已经全部扫描过了，下次不用再扫描它了。
            当垃圾回收开始时，Go 会把根对象标记为灰色，其他对象标记为白色，然后从根对象遍历搜索，
            按照上面的定义去不断的对灰色对象进行扫描标记。当没有灰色对象时，表示所有对象已扫描过，然后就可以开始清除白色对象了。
        `,
        difficulty: "hard",
      },
      {
        question: "GC 触发机制是什么样的 ？",
        answer: ` GC的触发:
            阈值：默认内存扩大一倍，启动gc
            定期：默认2min触发一次gc，src/runtime/proc.go:forcegcperiod
            手动：runtime.gc()
        `,
        difficulty: "easy",
      },
      {
        question: "什么是 goroutine 泄漏 ?",
        answer: `Go内存泄露，相当多数都是goroutine泄露导致的。
            虽然每个goroutine仅占用少量(栈)内存，但当大量goroutine被创建却不会释放时(即发生了goroutine泄露)，也会消耗大量内存，造成内存泄露。
            另外，如果goroutine里还有在堆上申请空间的操作，则这部分堆内存也不能被垃圾回收器回收
            坊间有说法，Go 10次内存泄漏，8次goroutine泄漏，1次是真正内存泄漏，还有1次是cgo导致的内存泄漏

            goroutine泄露的几个原因:
                1. 从 channel 里读，但是同时没有写入操作
                2. 向 无缓冲 channel 里写，但是同时没有读操作
                3. 向已满的 有缓冲 channel 里写，但是同时没有读操作
                4. select操作在所有case上都阻塞()
                5. goroutine进入死循环，一直结束不了
        `,
        difficulty: "medium",
      },
    ],
    flag: -1,
    diffMap: new Map([
      ["easy", "简单"],
      ["medium", "中等"],
      ["hard", "困难"],
    ]),
  }),
  methods: {
    toggleAccordion(id) {
      this.flag == id ? (this.flag = -1) : (this.flag = id);
    },
  },
};
</script>

<template>
  <div class="container">
    <h2>{{ title }}</h2>
    <div class="accordion">
      <div class="accordion-item" v-for="(item, index) in faq" :key="index">
        <button
          :id="index"
          :aria-expanded="index === flag"
          @click="toggleAccordion(index)"
        >
          <div class="title-wrapper">
            <span class="accordion-title">{{
              index + 1 + ".  " + item.question
            }}</span>
            <span
              class="accordion-difficulty"
              :data-difficulty="item.difficulty"
              >{{ diffMap.get(item.difficulty) }}</span
            >
          </div>
          <span class="icon" aria-hidden="true"></span>
        </button>
        <div class="accordion-content">
          <p>{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="copyright">
    <div>&copy;2022 <span>CoulsonZero</span> All rights reserved</div>
  </div>
</template>


<style>
@import url("https://fonts.googleapis.com/css?family=Hind:300,400&display=swap");
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
}

*::before,
*::after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

body {
  font-family: "Hind", sans-serif;
  /* background: #f8f8f8; */
  background: linear-gradient(to top, #e3edfd 0%, #cbe5ff 100%);
  /* background: linear-gradient(240deg, #edf4ff 0%, #a6d0fb 70%, #bbdcfd 100%); */
  color: #4d5974;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  min-height: 100vh;
}

.container {
  margin: 0 auto;
  padding: 4rem;
  width: 56rem;
}

.container h2 {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 5rem;
}

.accordion .accordion-item button[aria-expanded="false"] {
  border-bottom: 1px solid #aaa;
}

.accordion .accordion-item button[aria-expanded="true"] {
  /* border-bottom: 1px solid #03b5d2; */
  border-bottom: 1px solid #303030;
}

.accordion button {
  position: relative;
  display: block;
  text-align: left;
  width: 100%;
  padding: 1em 0;
  /* color: #7288a2; */
  /* color: #8e8989; */
  color: #7b7a7a;
  font-size: 1.15rem;
  font-weight: 300;
  border: none;
  background: none;
  outline: none;
}

.accordion button:hover,
.accordion button:focus {
  cursor: pointer;
  /* color: #03b5d2; */
  color: #131414;
}

.accordion button:hover::after,
.accordion button:focus::after {
  cursor: pointer;
  /* color: #03b5d2; */
  color: #131414;
  border: 1px solid #03b5d2;
}

.accordion button .title-wrapper {
  width: 90%;
}

.accordion button .accordion-title {
  padding: 1em 1.5em 1em 0;
}

.accordion-difficulty {
  font-size: 0.8rem;
}
.accordion-difficulty[data-difficulty="easy"] {
  color: #009975;
}
.accordion-difficulty[data-difficulty="medium"] {
  color: #fba324;
}
.accordion-difficulty[data-difficulty="hard"] {
  color: #ec4c47;
}

.accordion button .icon {
  display: inline-block;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border: 1px solid;
  border-radius: 22px;
  transition: all 0.3s ease;
}

.accordion button .icon::before {
  display: block;
  position: absolute;
  content: "";
  top: 9px;
  left: 5px;
  width: 10px;
  height: 2px;
  background: currentColor;
}

.accordion button .icon::after {
  display: block;
  position: absolute;
  content: "";
  top: 5px;
  left: 9px;
  width: 2px;
  height: 10px;
  background: currentColor;
}

.accordion button[aria-expanded="true"] {
  /* color: #03b5d2; */
  color: #131414;
}

.accordion button[aria-expanded="true"] .icon::after {
  width: 0;
}

.accordion button[aria-expanded="true"] + .accordion-content {
  opacity: 1;
  /* max-height: 9em; */
  max-height: 100em;
  /* transition: all 0.7s ease-in-out; */
  -webkit-transition: opacity 500ms ease-in-out, max-height 500ms ease-in-out;
  transition: opacity 500ms ease-in-out, max-height 500ms ease-in-out;
  will-change: opacity, max-height;
}

.accordion .accordion-content {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);
  /* -webkit-transition: opacity 150ms ease-in-out, max-height .3s ease-in-out;
  transition: opacity 150ms ease-in-out, max-height .3s ease-in-out;
  will-change: opacity, max-height; */
}

.accordion .accordion-content p {
  font-size: 1rem;
  font-weight: 300;
  margin: 2em 0;
  white-space: pre-line;
  letter-spacing: 1px;
  color: #303030;
}

.copyright {
  font-size: 86%;
  text-align: center;
  margin: 40px 0;
  color: #757678;
  font-weight: 300;
}
.copyright span {
  color: #303030;
  font-weight: 500;
}

@media screen and (max-width: 480px) {
  html {
    font-size: 70%;
  }
  .container {
    /* max-width: 30rem; */
    width: auto;
  }
  .accordion button .accordion-title {
    padding-right: 0.5em;
  }
  .accordion .accordion-content p {
    margin-top: 1rem;
  }
}

@media screen and (max-width: 900px) {
  html {
    font-size: 80%;
  }
}
/*# sourceMappingURL=FAQ.css.map */
</style>